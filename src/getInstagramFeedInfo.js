// @flow

import Axios from 'axios';
import get from 'lodash/get';
import slice from 'lodash/slice';

/**
 * This function returns a promise that when resolves return data extracted from the public profile page of an instagram account.
 */
async function getInstagramFeedInfo(
  account: string,
  options: {
    numberOfMediaElements: number,
    discardVideos: boolean,
  } = {
    numberOfMediaElements: 12,
    discardVideos: false,
  },
): Promise<{
  accountInfo: any,
  accountFollowedBy: number,
  accountFollow: number,
  postsCount: number,
  profilePic: string,
  accountName: string,
  media: Array<{
    id: string,
    displayImage: string,
    thumbnail: string,
    likes: number,
    caption: string,
    commentsNumber: number,
    accessibilityCaption: string,
    dimensions: { width: number, height: number },
    postLink: string,
  }>,
}> {
  let media = [];
  let accountInfo = {};

  try {
    const userInfoSource = await Axios.get(
      `https://www.instagram.com/${account}/`,
    );
    // userInfoSource.data contains the HTML from Axios
    const jsonObject = userInfoSource.data
      .match(
        /<script type="text\/javascript">window\._sharedData = (.*)<\/script>/,
      )[1]
      .slice(0, -1);

    accountInfo = get(
      JSON.parse(jsonObject),
      'entry_data.ProfilePage[0].graphql.user',
    );

    // Retrieve media info
    const mediaArray = slice(
      accountInfo.edge_owner_to_timeline_media.edges,
      0,
      options.numberOfMediaElements,
    );

    media = mediaArray.reduce((result, { node }) => {
      // Process only if is an image
      if (
        options.discardVideos &&
        // eslint-disable-next-line no-underscore-dangle
        node.__typename &&
        // eslint-disable-next-line no-underscore-dangle
        node.__typename !== 'GraphImage'
      ) {
        return result;
      }

      // Return node
      result.push({
        id: get(node, 'id'),
        displayImage: get(node, 'display_url'),
        thumbnail: get(node, 'thumbnail_src'),
        likes: get(node, 'edge_liked_by.count'),
        caption: get(node, 'edge_media_to_caption.edges[0].node.text'),
        commentsNumber: get(node, 'edge_media_to_comment.count'),
        accessibilityCaption: get(node, 'accessibility_caption'),
        dimensions: get(node, 'dimensions'),
        postLink: `https://www.instagram.com/p/${get(node, 'shortcode')}/`,
      });
      return result;
    }, media);
  } catch (e) {
    throw new Error(`Unable to retrieve info. Reason: ${e.toString()}`);
  }

  return {
    accountInfo,
    accountFollowedBy: get(accountInfo, 'edge_followed_by.count'),
    accountFollow: get(accountInfo, 'edge_follow.count'),
    postsCount: get(accountInfo, 'edge_owner_to_timeline_media.count'),
    profilePic: get(accountInfo, 'profile_pic_url_hd'),
    accountName: get(accountInfo, 'username'),
    media,
  };
}

export default getInstagramFeedInfo;
