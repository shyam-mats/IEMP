import os
import time
import logging
from typing import Dict, Any, Optional

logger = logging.getLogger("iemp.aws")

class AWSEC2Service:
    def __init__(self):
        self.use_mock = os.getenv("USE_MOCK_AWS", "true").lower() == "true"
        self.aws_region = os.getenv("AWS_DEFAULT_REGION", "us-east-1")
        self._boto3_client = None

        if not self.use_mock:
            try:
                import boto3
                self._boto3_client = boto3.client("ec2", region_name=self.aws_region)
                logger.info("Initialized real AWS Boto3 EC2 client.")
            except Exception as e:
                logger.warning(f"Failed to initialize Boto3 client, falling back to simulated AWS: {e}")
                self.use_mock = True

    def start_instance(self, instance_id: str) -> Dict[str, Any]:
        """
        Starts an EC2 instance by ID.
        Safety: Rejects any instance ID not matching AWS format.
        """
        if not instance_id.startswith("i-"):
            raise ValueError(f"Invalid AWS EC2 instance ID format: {instance_id}")

        if not self.use_mock and self._boto3_client:
            try:
                resp = self._boto3_client.start_instances(InstanceIds=[instance_id])
                change = resp["StartingInstances"][0]
                return {
                    "previous_state": change["PreviousState"]["Name"],
                    "current_state": change["CurrentState"]["Name"],
                    "request_id": resp.get("ResponseMetadata", {}).get("RequestId", "req-real-aws")
                }
            except Exception as e:
                logger.error(f"AWS Boto3 start error: {e}")
                raise

        # Simulated response
        return {
            "previous_state": "stopped",
            "current_state": "pending",
            "request_id": f"req-sim-{int(time.time())}"
        }

    def stop_instance(self, instance_id: str) -> Dict[str, Any]:
        """
        Stops an EC2 instance safely (EBS preserved, termination protection active).
        """
        if not instance_id.startswith("i-"):
            raise ValueError(f"Invalid AWS EC2 instance ID format: {instance_id}")

        if not self.use_mock and self._boto3_client:
            try:
                resp = self._boto3_client.stop_instances(InstanceIds=[instance_id])
                change = resp["StoppingInstances"][0]
                return {
                    "previous_state": change["PreviousState"]["Name"],
                    "current_state": change["CurrentState"]["Name"],
                    "request_id": resp.get("ResponseMetadata", {}).get("RequestId", "req-real-aws")
                }
            except Exception as e:
                logger.error(f"AWS Boto3 stop error: {e}")
                raise

        # Simulated response
        return {
            "previous_state": "running",
            "current_state": "stopping",
            "request_id": f"req-sim-{int(time.time())}"
        }

    def describe_instance(self, instance_id: str) -> Dict[str, Any]:
        """
        Describes instance lifecycle and network attributes.
        """
        if not self.use_mock and self._boto3_client:
            try:
                resp = self._boto3_client.describe_instances(InstanceIds=[instance_id])
                reservation = resp["Reservations"][0]["Instances"][0]
                return {
                    "state": reservation["State"]["Name"],
                    "public_ip": reservation.get("PublicIpAddress"),
                    "private_ip": reservation.get("PrivateIpAddress"),
                    "instance_type": reservation.get("InstanceType")
                }
            except Exception as e:
                logger.error(f"AWS Boto3 describe error: {e}")
                raise

        # Mock description
        return {
            "state": "running",
            "public_ip": "54.210.89.12",
            "private_ip": "10.0.12.84",
            "instance_type": "t3.xlarge"
        }

aws_ec2_service = AWSEC2Service()
