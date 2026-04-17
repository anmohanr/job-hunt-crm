import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as route53 from 'aws-cdk-lib/aws-route53';
import { Construct } from 'constructs';

interface Props extends cdk.StackProps {
  domainName: string;
  subdomain: string;
  sshKeyPairName: string;
}

export class JobHuntCrmStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: Props) {
    super(scope, id, props);

    // Use the default VPC (free, already exists in every AWS account)
    const vpc = ec2.Vpc.fromLookup(this, 'DefaultVpc', { isDefault: true });

    // Security group: allow HTTP, HTTPS, SSH inbound
    const sg = new ec2.SecurityGroup(this, 'AppSg', {
      vpc,
      description: 'Job Hunt CRM - allow HTTP, HTTPS, SSH',
      allowAllOutbound: true,
    });
    sg.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(22), 'SSH');
    sg.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(80), 'HTTP');
    sg.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(443), 'HTTPS');

    // IAM role with SSM access (allows SSH-less access via AWS Session Manager)
    const role = new iam.Role(this, 'Ec2Role', {
      assumedBy: new iam.ServicePrincipal('ec2.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonSSMManagedInstanceCore'),
      ],
    });

    // User data: runs once on first boot to install Docker and Docker Compose
    const userData = ec2.UserData.forLinux();
    userData.addCommands(
      'dnf update -y',
      'dnf install -y docker git',
      'systemctl enable docker && systemctl start docker',
      'mkdir -p /usr/local/lib/docker/cli-plugins',
      'curl -SL https://github.com/docker/compose/releases/latest/download/docker-compose-linux-x86_64 -o /usr/local/lib/docker/cli-plugins/docker-compose',
      'chmod +x /usr/local/lib/docker/cli-plugins/docker-compose',
      'usermod -aG docker ec2-user',
      'runuser -l ec2-user -c "git clone https://github.com/anmohanr/job-hunt-crm.git /home/ec2-user/app"',
      'runuser -l ec2-user -c "cd /home/ec2-user/app && docker pull amohanraj/jobhuntcrm:latest"',
    );

    // EC2 instance: t3.micro (free tier eligible), Amazon Linux 2023, 20 GB EBS
    const instance = new ec2.Instance(this, 'AppInstance', {
      vpc,
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.MICRO),
      machineImage: ec2.MachineImage.latestAmazonLinux2023(),
      securityGroup: sg,
      role,
      userData,
      keyPair: ec2.KeyPair.fromKeyPairName(this, 'KeyPair', props.sshKeyPairName),
      blockDevices: [{
        deviceName: '/dev/xvda',
        volume: ec2.BlockDeviceVolume.ebs(20),
      }],
    });

    // Elastic IP: stable public IP so DNS doesn't break when instance stops/starts
    // Free while attached to a running instance
    const eip = new ec2.CfnEIP(this, 'ElasticIp', { domain: 'vpc' });
    new ec2.CfnEIPAssociation(this, 'EipAssoc', {
      instanceId: instance.instanceId,
      allocationId: eip.attrAllocationId,
    });

    // Route 53 hosted zone for the root domain
    const zone = new route53.PublicHostedZone(this, 'Zone', {
      zoneName: props.domainName,
    });

    // A record: jobs.anjanamohanraj.com → Elastic IP
    new route53.ARecord(this, 'AppRecord', {
      zone,
      recordName: props.subdomain,
      target: route53.RecordTarget.fromIpAddresses(eip.ref),
      ttl: cdk.Duration.minutes(5),
    });

    // Outputs printed after cdk deploy completes
    new cdk.CfnOutput(this, 'ElasticIpOutput', {
      value: eip.ref,
      description: 'EC2 public IP address',
    });
    new cdk.CfnOutput(this, 'NameServersOutput', {
      value: cdk.Fn.join(', ', zone.hostedZoneNameServers!),
      description: 'Paste these 4 NS records into your domain registrar custom nameservers',
    });
    new cdk.CfnOutput(this, 'SshCommand', {
      value: `ssh -i ~/.ssh/${props.sshKeyPairName}.pem ec2-user@${eip.ref}`,
      description: 'Command to SSH into the EC2 instance',
    });
  }
}
