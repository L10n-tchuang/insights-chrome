import React, { useState } from 'react';
import {
  Button,
  Checkbox,
  Form,
  FormGroup,
  Panel,
  PanelMain,
  PanelMainBody,
  Text,
  TextArea,
  TextContent,
  TextVariants,
} from '@patternfly/react-core';
import './Feedback.scss';
import Cookies from 'js-cookie';
import PropTypes from 'prop-types';
import { getEnv, getUrl, isProd } from '../../utils.ts';

const Feedback = ({ user, onCloseModal, onSubmit }) => {
  const [textAreaValue, setTextAreaValue] = useState('');
  const [checked, setChecked] = useState(false);
  const env = getEnv();
  const app = getUrl('app');
  const bundle = getUrl('bundle');
  const isAvailable = env === 'prod' || env === 'stage';
  const addFeedbackTag = () => (isProd() ? `[${bundle}]` : '[PRE-PROD]');

  const handleModalSubmission = () => {
    if (isAvailable) {
      fetch(`${window.origin}/api/platform-feedback/v1/issues`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${Cookies.get('cs_jwt')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description: `Feedback: ${textAreaValue}, Username: ${user.identity.user.username}, Account ID: ${user.identity.account_number}, Email: ${checked ? user.identity.user.email : ''}, URL: ${window.location.href}`, //eslint-disable-line
          summary: `${addFeedbackTag()} App Feedback`,
          labels: [app, bundle],
        }),
      }).then((response) => response.json());
    } else {
      console.log('Submitting feedback only works in prod and stage');
    }

    onSubmit();
  };

  return (
    <div className="chr-c-feedback-content">
      <TextContent>
        <Text component={TextVariants.h1}>Share your feedback with us!</Text>
      </TextContent>
      <Form>
        <FormGroup label="Enter your feedback" fieldId="horizontal-form-exp">
          <TextArea
            value={textAreaValue}
            onChange={(value) => setTextAreaValue(value)}
            name="feedback-description-text"
            id="feedback-description-text"
          />
        </FormGroup>
        <FormGroup className="pf-u-mt-20">
          <Checkbox
            id="feedback-checkbox"
            isChecked={checked}
            onChange={() => setChecked(!checked)}
            label="Yes, I would like to hear about research opportunities"
            description="Learn about opportunities to share your feedback with our User Research Team. We never shareyour personal information, and you can opt out at any time."
          />
        </FormGroup>
      </Form>
      {checked ? (
        <>
          <div className="pf-u-font-family-heading-sans-serif chr-c-feedback-email">Email</div>
          <Panel variant="raised" className="chr-c-feedback-panel">
            <PanelMain>
              <PanelMainBody className="chr-c-feedback-panel__body">{user.identity.user.email}</PanelMainBody>
            </PanelMain>
          </Panel>
        </>
      ) : (
        ''
      )}
      <div className="chr-c-feedback-buttons">
        <Button ouiaId="submit-feedback" key="confirm" variant="primary" onClick={handleModalSubmission}>
          Submit feedback
        </Button>
        <Button ouiaId="cancel-feedback" key="cancel" variant="link" onClick={onCloseModal}>
          Cancel
        </Button>
      </div>
    </div>
  );
};

Feedback.propTypes = {
  user: PropTypes.object,
  modalPage: PropTypes.string,
  setModalPage: PropTypes.func,
  onCloseModal: PropTypes.func,
  onSubmit: PropTypes.func,
};

export default Feedback;
