import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "img");
  },
  filename: function (req, file, cb) {
    const fileType = file.mimetype.split("/")[1];
    cb(null, file.fieldname + "-" + Date.now() + "." + fileType);
  },
});

const upload = multer({ storage: storage });

export default upload;
