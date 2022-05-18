import express from 'express';
import bodyParser from 'body-parser';
import {filterImageFromURL, deleteLocalFiles, validateUrl} from './util/util';

(async () => {

  // Init the Express application
  const app = express();

  // Set the network port
  const port = process.env.PORT || 8082;
  
  // Use the body parser middleware for post requests
  app.use(bodyParser.json());

  
  //filteredimage get
  app.get("/filteredimage", async (req:express.Request, res:express.Response) => {
    const image_url = req.query.image_url;

    try {
      if (!image_url) {
        res.status(400).send("Image url is required")
      }

      let isImageUrlValid = validateUrl(image_url);

      console.log("image_url", isImageUrlValid);
    
      if (!isImageUrlValid) {
        res.status(400).send("Image url is not valid")
      }

      let result = await filterImageFromURL(image_url);
      res.status(200).sendFile(result);
      
     res.on('finish', () => {
        console.log("Deleting image", result)
        deleteLocalFiles([result]);
      });
    }
    catch (error) {
      if((error as Error).message == 'Could not find MIME for Buffer <null>')
        res.status(422).send("Image can not be processed");

      res.status(500).send("Unable to process your request");
    }
  });

  // Root Endpoint
  // Displays a simple message to the user
  app.get( "/", async ( req:express.Request, res:express.Response) => {
    res.send("try GET /filteredimage?image_url={{}}")
  } );
  

  // Start the Server
  app.listen( port, () => {
      console.log( `server running http://localhost:${ port }` );
      console.log( `press CTRL+C to stop server` );
  } );
})();