import User from '../models/User';
import { Request, Response, NextFunction } from 'express';
import { IReqAuth, IUserUpdateForm } from '../config/interface';
import Twitter from 'twit';

export const userUpdate = async (
  req: IReqAuth,
  res: Response,
  next: NextFunction
) => {
  const { ...userUpdateProps }: IUserUpdateForm = req.body;
  const query = req.user._id;
  const update = { ...userUpdateProps };
  const options = {
    new: true,
    runValidators: true,
    context: 'query',
  };

  await User.findByIdAndUpdate(query, update, options, (err, doc) => {
    if (!err) {
      res.status(200).send(doc);
    }
  })
    .clone()
    .catch((err) => {
      err.status = 422;
      next(err);
    });
};

export const userFollowAll = async (
  req: IReqAuth,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log(`User is about to follow '${req.query['username']}'`);

    let username = req.query['username'] as string;

    const twitter = new Twitter({
      consumer_key: process.env.TWITTER_CONSUMER_KEY,
      consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
      access_token: req.user.twitterToken,
      access_token_secret: req.user.twitterTokenSecret,
    });

    const doTwitterFollow = await twitter.post('friendships/create', {
      screen_name: username,
    });

    res.json(doTwitterFollow.resp.statusCode);
  } catch (err) {
    next(err);
  }
};

export const getUser = async (
  req: IReqAuth,
  res: Response,
  next: NextFunction
) => {
  try {
    res.status(200).send(req.user);
  } catch (err) {
    next(err);
  }
};

export const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await User.find(
      { gitHubConnected: true, twitterConnected: true },
      {
        discordToken: 0,
        gitHubToken: 0,
        twitterToken: 0,
        twitterTokenSecret: 0,
      }
    ).clone();
    res.status(200).send([...users]);
  } catch (err) {
    console.error(err);
    next(err);
  }
};


