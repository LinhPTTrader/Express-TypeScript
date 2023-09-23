import { Router } from "express";
import { ServerVideoController, ServerImageController } from "~/controllers/media.controllers";
import { AccessTokenMediaValidator } from "~/middlewares/medias.middlewares";

const staticRouter = Router();


/**
 * Description:  Get Image
 * Path: //image/:name
 * Method: GET
 * Header: {Authorization: Bearer: <accessToken>}
 * Params: name
 */
staticRouter.get('/image/:name', AccessTokenMediaValidator, ServerImageController)

/**
 * Description:  Get Video
 * Path: /video/:name
 * Method: GET
 * Header: {Authorization: Bearer: <accessToken>}
 * Body: name
 */
staticRouter.get('/video/:name', ServerVideoController)


export default staticRouter;