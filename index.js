/**
 * @version 1
 **/
import fs from 'fs/promises';
import path from 'path';
import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const snsClient = new SNSClient({ region: "eu-west-2" });
const s3Client = new S3Client({ region: "eu-west-2" });

const NEWFILES_PATH = process.env.FILEWATCH_FOLDER_PATH;
const VERBOSE = process.env.FILEWATCH_VERBOSE ?? 0;
const PROCESS_PATH = './process';
const FAILED_PATH = './failed';
const ARCHIVE_PATH = './archive';

async function uploadToS3(bucketName, key, body) {
	try {
		const params = {
			Bucket: bucketName,
			Key: key,
			Body: body,
		};
		const command = new PutObjectCommand(params);
		const response = await s3Client.send(command);
		console.log(`File uploaded to S3 successfully: ${bucketName}/${key}`);
		return response;
	} catch (error) {
		console.error("Error uploading to S3:", error);
		throw error;
	}
}

async function publishToSNS(topicArn, message) {
	try {

		const params = {
			TopicArn: topicArn,
			Message: message,
		};

		const command = new PublishCommand(params);
		const response = await snsClient.send(command);

		console.log("Message published successfully:", response.MessageId);
		return response;
	} catch (error) {
		console.error("Error publishing to SNS:", error);
		throw error;
	}
}

async function processFile(data, file) {
	console.log(`data`, data);
	console.log(`file`, file);

	return 501;
};


async function checkForNewFiles() {
	if (VERBOSE) {
		console.log('checkForNewFiles()');
	}
	console.log(VERBOSE);
	let newFiles = await fs.readdir(NEWFILES_PATH);
	if (newFiles.length) {
		// Only process the first one.
		for (let index = 0; index < newFiles.length; index++) {
			const file = newFiles[index];

			console.log(`File added: ${file}`);
			const oldPath = path.join(NEWFILES_PATH, file);
			const processPath = path.join(PROCESS_PATH, file);

			await fs.rename(oldPath, processPath);

			console.log(`Moved file: ${file}`);
			const data = await fs.readFile(processPath, 'utf8');

			const statusCode = await processFile(data, file);

			if (statusCode === 201 || statusCode === 200) {
				const archivePath = path.join(ARCHIVE_PATH, file);
				await fs.rename(processPath, archivePath);
				console.log('ARCHIVED');
			} else {
				const failedPath = path.join(FAILED_PATH, file);
				await fs.rename(processPath, failedPath);
				console.log('FAILED');
				process.exit(1);
			}
		}
	}
}

async function sendMessage(message) {
	// await publishToSNS("arn:aws:sns:eu-west-2:575234670331:sftp_activity", message);
	console.log(message);
}

if (!NEWFILES_PATH) {
	throw new Error('Missing NEWFILES_PATH');
}
// await sendMessage("LOADED");
await checkForNewFiles();

console.log('done');
