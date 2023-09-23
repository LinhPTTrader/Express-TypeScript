import { result } from 'lodash';
import { checkSchema } from "express-validator";
import { ObjectId } from "mongodb";
import { HTTP_STATUS } from "~/constants/httpStatus";
import { ErrorWithStatus } from "~/models/schemas/Errors";
import tweetService from "~/services/tweets.services";
import { validate } from "~/utils/validation";
import { TWEETS_MESSAGES } from '~/constants/messages';



export const LikeValidator = validate(checkSchema({
    tweet_id: {
        custom: {
            options: async (value, { req }) => {
                if (ObjectId.isValid(value)) {
                    const result = await tweetService.IsCheckTweetId(new ObjectId(value))
                    if (result) {
                        return true
                    } else {
                        throw new ErrorWithStatus({ message: TWEETS_MESSAGES.INVALID_TWEET_ID, status: HTTP_STATUS.UNPROCESSABLE_ENTITY })
                    }
                }
                else {
                    throw new ErrorWithStatus({ message: "tweet_id is not valid", status: HTTP_STATUS.UNPROCESSABLE_ENTITY })
                }
            }
        }
    }
}))