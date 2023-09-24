import { ObjectId } from "mongodb";

[
    {
        '$match': {
            '_id': new ObjectId('650ff1034c155fe0a1da7305')
        }
    }, {
        '$lookup': {
            'from': 'hashtag',
            'localField': 'hashtags',
            'foreignField': '_id',
            'as': 'hashtags'
        }
    }, {
        '$lookup': {
            'from': 'users',
            'localField': 'mentions',
            'foreignField': '_id',
            'as': 'mentions'
        }
    }, {
        '$addFields': {
            'mentions': {
                '$map': {
                    'input': '$mentions',
                    'as': 'mentions',
                    'in': {
                        '_id': '$$mentions._id',
                        'name': '$$mentions.name',
                        'username': '$$mentions.username'
                    }
                }
            }
        }
    }
]