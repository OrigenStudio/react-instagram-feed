// @flow
import compose from 'recompose/compose';
import withStateHandlers from 'recompose/withStateHandlers';
import lifeCycle from 'recompose/lifecycle';
import type { HOC } from 'recompose';
import getInstagramFeedInfo from '../getInstagramFeedInfo';

export type Enhanced = {
  account: string,
  numberOfMediaElements?: number,
  discardVideos?: boolean,
};

export type Base = {
  photos: Array<{}>,
};

const enhancer: HOC<*, Enhanced> = compose(
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

export default enhancer;
