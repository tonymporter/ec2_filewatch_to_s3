# ec2_filewatch_to_s3

This is designed to run in an EC2 instance with access to SNS (if environment variable set) and S3.

This code checks the folder in FILEWATCH_FOLDER_PATH and moves any found to the FILEWATCH_S3_BUCKET.

## Environment variables

FILEWATCH_FOLDER_PATH
Where to check for files

FILEWATCH_VERBOSE
Default is not verbose, set this to 1 for verbose

FILEWATCH_SNS_TOPIC_ARN;
Default is not to send SNS messages, set this to your SNS arn to receive messages

FILEWATCH_PROCESS_PATH
Where move files that have been processed

FILEWATCH_FAILED_PATH
If the S3 put fails, the file is moved here

FILEWATCH_ARCHIVE_PATH
Future use

FILEWATCH_S3_BUCKET
The S3 bucket to move to
