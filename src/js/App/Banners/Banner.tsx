import React from 'react';
import { useIntl } from 'react-intl';
import messages from '../../Messages';
import { Button, Text, TextVariants } from '@patternfly/react-core';
import ArrowRightIcon from '@patternfly/react-icons/dist/js/icons/arrow-right-icon';
import './Banner.scss';

const Banner = () => {
  const intl = useIntl();
  const bannerContent = {
    title: `${intl.formatMessage(messages.changesComing)}`,
    link: {
      title: `${intl.formatMessage(messages.learnMore)}`,
      href: 'https://www.openshift.com/blog/check-out-our-new-look',
    },
  };
  return (
    <div className="chr-banner">
      <Text component={TextVariants.h3}>{bannerContent.title}</Text>
      <Button variant="link" isLarge component="a" href={bannerContent.link.href} target="_blank">
        {bannerContent.link.title} <ArrowRightIcon />
      </Button>
    </div>
  );
};

export default Banner;
