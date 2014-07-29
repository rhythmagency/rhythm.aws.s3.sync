rhythm.aws.s3.sync
==================

Synchronize local files with S3.


#### Usage:

    $ grunt download --bucket=NAME_OF_S3_BUCKET

#### Optionally overwrite local files:

    $ grunt download --bucket=NAME_OF_S3_BUCKET --overwrite=yes

### Amazon credentials are read from ./awsconfig.json with a fallback of ~/.aws/credentials

#### Example awsconfig.json

    {
    "accessKeyId": "ACCESS_KEY_ID",
    "secretAccessKey": "SECRET_ACCESS_KEY"
    }

#### Example ~/.aws/credentials

    [default]
    aws_access_key_id = ACCESS_KEY_ID
    aws_secret_access_key = SECRET_ACCESS_KEY