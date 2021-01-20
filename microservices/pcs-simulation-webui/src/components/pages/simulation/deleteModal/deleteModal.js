// Copyright (c) Microsoft. All rights reserved.

import React from 'react';

import { svgs } from 'utilities';
import { Btn, BtnToolbar, Modal } from 'components/shared';

import './deleteModal.scss';

export const DeleteModal = ({ t, onClose, simulationName, onDelete }) => (
  <Modal onClose={onClose}>
    <div className="delete-modal-container">
      <div className="delete-modal-header">
        { t('simulation.modals.delete.header') }
        <Btn svg={svgs.x} className="modal-icon" onClick={onClose} />
      </div>
      <div className="delete-modal-content">
        <div>{ t('simulation.modals.delete.description') } </div>
        <div>{ t('simulation.modals.delete.nameConfirmation', { simulationName }) }</div>
      </div>
      <BtnToolbar>
        <Btn svg={svgs.trash} onClick={onDelete}>
          { t('simulation.modals.delete.apply') }
        </Btn>
        <Btn svg={svgs.cancelX} onClick={onClose}>{ t('simulation.modals.cancel') }</Btn>
      </BtnToolbar>
    </div>
  </Modal>
);
