import boto3
from botocore.config import Config
from dotenv import load_dotenv

from models.post import Post


class S3:
    def __init__(self, bucket: str = "ramhack"):
        load_dotenv()
        self.bucket = bucket
        self.client = boto3.client(
            's3',
            region_name='us-east-2',
            endpoint_url='https://s3.us-east-2.amazonaws.com',
            config=Config(signature_version='s3v4')
        )

    def upload_file(self, file: bytes, post: Post) -> str:
        """
        Upload a file to S3 with post metadata

        Args:
            file: The file content (bytes) to upload
            post: The post object containing metadata

        Returns:
            The unique S3 key for the uploaded file
        """
        key = f"tts/trump/{post.date}.mp3"

        try:
            self.client.put_object(
                Bucket=self.bucket,
                Key=key,
                Body=file,
                ContentType='audio/mpeg',
                ServerSideEncryption='AES256',
                Metadata={
                    'author': post.author,
                    'date': str(post.date)
                }
            )

            return key

        except Exception as e:
            print(f"S3 upload error: {e}")
            raise Exception(f"Failed to upload file to S3: {str(e)}")

    def get_presigned_url(self, key: str):
        """
        Generate a presigned URL for accessing the file in S3

        Args:
            key: The S3 key for the file

        Returns:
            The presigned URL
        """
        try:
            url = self.client.generate_presigned_url(
                'get_object',
                Params={
                    'Bucket': self.bucket,
                    'Key': key
                },
                ExpiresIn=3600  # URL valid for 1 hour
            )
            return url
        except Exception as e:
            print(f"Error generating presigned URL: {e}")
            raise Exception(f"Failed to generate presigned URL: {str(e)}")
