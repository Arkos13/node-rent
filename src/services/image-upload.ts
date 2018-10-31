import * as aws from "aws-sdk";
import * as multer from "multer";
import * as multerS3 from "multer-s3";
import {Request} from "express";
import * as dotenv from "dotenv";
dotenv.config();

aws.config.update({
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  region: "us-east-2"
});

export class ImageUpload {
  private static s3 = new aws.S3();

  private static fileFilter(req: Request, file, callback: any) {
    if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
      callback(null, true);
    } else {
      callback(new Error("Invalid file type, only JPEG and PNG is allowed!"), false);
    }
  }

  public static getMulter() {
    const fileFilter = ImageUpload.fileFilter;
    const s3 = ImageUpload.s3;
    return multer({
      fileFilter,
      storage: multerS3({
        acl: "public-read",
        s3,
        bucket: "angularrent",
        metadata: function (req, file, callback) {
          callback(null, {fieldName: "TESTING_METADATA"});
        },
        key: function (req, file, callback) {
          callback(null, Date.now().toString());
        }
      })
    });
  }
}
