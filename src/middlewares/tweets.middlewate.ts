

import { checkSchema } from "express-validator";
import { isEmpty } from "lodash";
import { ObjectId } from "mongodb";
import { MediaType, TweetAudience, TweetType } from "~/constants/enum";
import { HTTP_STATUS } from "~/constants/httpStatus";
import { TWEETS_MESSAGES } from "~/constants/messages";
import { ErrorWithStatus } from "~/models/schemas/Errors";
import { numberEnumToArray } from "~/utils/commons";
import { validate } from "~/utils/validation";

export const CreateTweetValidator = validate(
    checkSchema({
        type: {
            isIn: {
                options: [numberEnumToArray(TweetType)],
                errorMessage: new ErrorWithStatus({ message: TWEETS_MESSAGES.INVALID_TYPE, status: HTTP_STATUS.UNPROCESSABLE_ENTITY })
            }
        },
        audience: {
            isIn: {
                options: [numberEnumToArray(TweetAudience)],
                errorMessage: new ErrorWithStatus({ message: TWEETS_MESSAGES.INVALID_AUDIENCE, status: HTTP_STATUS.UNPROCESSABLE_ENTITY })
            }
        },
        parent_id: {
            custom: {
                options: (value, { req }) => {
                    const type = req.body.type as TweetType

                    if (!(type === TweetType.Tweet) && !ObjectId.isValid(value)) {
                        throw new ErrorWithStatus({ message: TWEETS_MESSAGES.PARENT_ID_MUST_BE_A_VALID_TWEET_ID, status: HTTP_STATUS.UNPROCESSABLE_ENTITY })
                    }
                    if (type === TweetType.Tweet && value !== null) {
                        throw new ErrorWithStatus({ message: TWEETS_MESSAGES.PARENT_ID_MUST_BE_NULL, status: HTTP_STATUS.UNPROCESSABLE_ENTITY })
                    }
                    return true
                }
            }
        },
        content: {
            isString: true,
            custom: {
                options: (value, { req }) => {
                    const type = req.body.type as TweetType


                    if (type === TweetType.Retweet) {
                        if (value === "" || value === null) {
                            throw new ErrorWithStatus({ message: TWEETS_MESSAGES.CONTENT_MUST_BE_EMPTY_STRING, status: HTTP_STATUS.UNPROCESSABLE_ENTITY })
                        }
                    }
                    const hashtags = req.body.hashtags as string[]
                    const mentions = req.body.mentions as string[]
                    // Nếu `type` là comment, quotetweet, tweet và không có `mentions` và `hashtags` thì `content` phải là string và không được rỗng
                    if (
                        [TweetType.Comment, TweetType.QuoteTweet, TweetType.Tweet].includes(type) &&
                        isEmpty(hashtags) &&
                        isEmpty(mentions) &&
                        value === ''
                    ) {
                        throw new Error(TWEETS_MESSAGES.CONTENT_MUST_BE_A_NON_EMPTY_STRING)
                    }
                    return true;
                }

            }
        },
        hashtags: {
            isArray: true,
            custom: {
                options: (value, { req }) => {
                    let isCheck = true
                    value.forEach((element: any) => {
                        if (typeof (element) !== 'string') {
                            isCheck = false
                        }
                    });
                    if (!isCheck) {
                        throw new ErrorWithStatus({ message: TWEETS_MESSAGES.HASHTAGS_MUST_BE_AN_ARRAY_OF_STRING, status: HTTP_STATUS.UNPROCESSABLE_ENTITY })
                    } else {
                        return true
                    }
                }
            }
        },
        mentions: {
            isArray: true,
            custom: {
                options: (value, { req }) => {
                    let isCheck = true
                    value.forEach((element: any) => {
                        if (!(ObjectId.isValid(element))) {
                            isCheck = false
                        }
                    });
                    if (!isCheck) {
                        throw new ErrorWithStatus({ message: TWEETS_MESSAGES.MENTIONS_MUST_BE_AN_ARRAY_OF_USER_ID, status: HTTP_STATUS.UNPROCESSABLE_ENTITY })
                    } else {
                        return true
                    }
                }
            }
        },
        medias: {
            isArray: true,
            custom: {
                options: (value, { req }) => {
                    let isCheck = true;
                    const mediaType = numberEnumToArray(value);
                    value.forEach((element: any) => {
                        if (typeof (element.url) !== 'string' || mediaType.includes(element.type)) {
                            isCheck = false
                        }
                    });
                    if (!isCheck) {
                        throw new ErrorWithStatus({ message: TWEETS_MESSAGES.MEDIAS_MUST_BE_AN_ARRAY_OF_MEDIA_OBJECT, status: HTTP_STATUS.UNPROCESSABLE_ENTITY })
                    } else {
                        return true
                    }
                }
            }
        }
    }))

export const PanagationValidator = validate(checkSchema({
    limit: {
        isNumeric: {
            errorMessage: new ErrorWithStatus({ message: "Limit and Page require number", status: HTTP_STATUS.UNAUTHORIZED })
        },
        custom: {
            options: (value, { req }) => {
                const num = Number(value)
                if (num > 100 || num < 1) {
                    throw new ErrorWithStatus({ message: "Limit and Page must be in the range [1-100]", status: HTTP_STATUS.UNPROCESSABLE_ENTITY })
                } else {
                    return true
                }
            }
        }
    },
    page: {
        isNumeric: {
            errorMessage: new ErrorWithStatus({ message: "Limit and Page require number", status: HTTP_STATUS.UNAUTHORIZED })
        },
        custom: {
            options: (value, { req }) => {
                const num = Number(value)
                if (num > 100 || num < 1) {
                    throw new ErrorWithStatus({ message: "Limit and Page must be in the range [1-100]", status: HTTP_STATUS.UNPROCESSABLE_ENTITY })
                } else {
                    return true
                }
            }
        }
    }
}, ['query']))
