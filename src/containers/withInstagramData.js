// @flow
import compose from 'recompose/compose';
import withStateHandlers from 'recompose/withStateHandlers';
import lifeCycle from 'recompose/lifecycle';
import type { HOC } from 'recompose';
import getInstagramFeedInfo from '../getInstagramFeedInfo';

export type Base = {
  status: 'completed' | 'loading' | 'failed',
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
};

export type Enhanced = {
  account: string,
  numberOfMediaElements?: number,
  discardVideos?: boolean,
};

/**
 * This is a HoC that injects instagram data as props. See supported props below:
 * @param {string} account account from where to get data from.
 * @param {number} [numberOfMediaElements=12] number of media elements to get. Max 12.
 * @param {boolean} [discardVideos=false] discard videos from media elements.
 * @returns injects the data from `getInstagramFeedInfo` to the props of the wrapped component.
 */
const withInstagramData: HOC<Base, Enhanced> = compose(
  withStateHandlers(
    { status: 'loading' },
    {
      updateStatus: () => newStatus => ({ status: newStatus }),
    },
  ),
  lifeCycle({
    componentDidMount() {
      const {
        account,
        numberOfMediaElements,
        discardVideos,
        updateStatus,
      } = this.props;
      getInstagramFeedInfo(account, { numberOfMediaElements, discardVideos })
        .then(result => {
          // Will send this state as props to the component
          this.setState({
            ...result,
          });
          updateStatus('completed');
        })
        .catch(() => {
          updateStatus('failed');
        });
    },
  }),
);

export default withInstagramData;
