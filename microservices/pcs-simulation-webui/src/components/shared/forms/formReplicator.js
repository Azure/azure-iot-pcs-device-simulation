// Copyright (c) Microsoft. All rights reserved.

import React, { Component } from 'react';
import update from 'immutability-helper';
import PropTypes from 'prop-types';
import { isFunc, isObject } from 'utilities';

/**
 * The FormReplicator component is used to replicate subsections of forms.
 * In data terms, the FormReplicator takes an input value of an array of
 * objects and binds it with some declarative markup passed as its children.
 *
 * TODO: Move to README.md file
 *
 * Usage:
 * ==== Example 1: Single FormReplicator
 * const newTag = () => ({ tag: '' });
 * class TagForm extends Component {
 *
 *   constructor(props) {
 *     super(props);
 *     this.state = { tags: [] };
 *   }
 *
 *   addTag = () => this.setState({ tags: [ ...this.state.tags, newTag() ] });
 *   onChange = ({ target: { name, value } }) => ({ name, value });
 *   updateState = (tags) => this.setState({ tags });
 *
 *   render() {
 *     // NOTE: For an input functionality to replicate, the "replicable" attribute must be set
 *     //       Otherwise the input will behave the same as if it was outside the replicator
 *     const inputProps = { type: 'text', replicable: true, onChange: this.onChange };
 *     return (
 *       <div>
 *         <FormReplicator value={this.state.tags} onChange={this.updateState}>
 *           <div className="tag-form-container">
 *             <input { ...inputProps } name="tag" />
 *             <button deletebtn>Remove</button>
 *           </div>
 *         </FormReplicator>
 *         <button onClick={this.addTag}>+ Tag</button>
 *       </div>
 *     );
 *   }
 * }
 *
 * ==== Example 2: Nested FormReplicator
 * const newTag = () => ({ tag: '', metadata: [] });
 * const newMetadata = () => ({ meta: '' });
 * ...
 * // Inside the component
 * // Tell the replicator how to create a new state from the current state
 * addMetadata = (currMetadataState) => [ ...currMetadataState, newMetadata() ];
 * ...
 * // In the render function
 * <FormReplicator value={this.state.tags} onChange={this.updateState}>
 *   <div className="tag-form-container">
 *     <input { ...inputProps } name="tag" />
 *     <FormReplicator name="metadata">
 *       <div>
 *         <input { ...inputProps } name="meta" />
 *         <button deletebtn>Delete Metadata</button>
 *       </div>
 *     </FormReplicator>
 *     <button addBtnFor="tags" addBtnAction={this.addMetadata}>+ Metadata</button>
 *     <button deletebtn>Delete Tag</button>
 *   </div>
 * </FormReplicator>
 * <button onClick={this.addTag}>+ Tag</button>
 * ...
 */

export class FormReplicator extends Component {

  /** Performs an immutable state update for the props.value array */
  updateState = (idx, name, value) => {
    const newData = update(this.props.value, { [idx]: { [name]: { $set: value } } });
    // TODO: Update this to return an input event object { target: { name, value } }
    //       So the user doesn't need a bespoke onChange handler
    this.props.onChange(newData);
  }

  /** Used if a user adds a FormReplicator inside another FormReplicator and needs an add btn */
  addItem = (idx, name, getNewState) =>
    () => this.updateState(idx, name, getNewState(this.props.value[idx][name]));

  /** Deletes am item from the props.value array */
  deleteItem = idxToRemove =>
    () => this.props.onChange(this.props.value.filter((_, idx) => idxToRemove !== idx));

  /** Used to update an element with the 'replicable' attribute */
  onChange = (idx, valueExtractor) => (event) => {
    const { name, value } = valueExtractor(event);
    this.updateState(idx, name, value);
  }

  cloneChildren = (children, idx) => {
    if (!isObject(children)) return children;
    return React.Children.map(children,
      child => {
        if (!isObject(child)) return child;
        return React.cloneElement(child, this.overrideProps(child, idx));
      }
    );
  }

  /**
   * Contains the cases for which elements needs to have special props added to
   * them during cloning
   */
  overrideProps = (child, idx) => {
    const {
      addBtnAction,
      addBtnFor,
      children,
      deletebtn,
      name,
      onChange,
      replicable
    } = child.props || {};

    const isReplicatorComp = child.type && child.type.name === 'FormReplicator';

    if (isReplicatorComp) {
      return {
        onChange: this.onChange(idx, value => ({ name, value })),
        value: this.props.value[idx][name]
      };
    } else if (!!addBtnFor && addBtnAction) {
      return {
        onClick: this.addItem(idx, addBtnFor, addBtnAction)
      };
    } else if (!!deletebtn) {
      return {
        onClick: this.deleteItem(idx)
      };
    } else if (!!replicable && onChange) {
      return {
        replicable: 'true', // Added to avoid placing a gray attribute to DOM nodes
        onChange: this.onChange(idx, onChange),
        value: this.props.value[idx][name],
        children: this.cloneChildren(children, idx)
      };
    } else {
      return {
        children: this.cloneChildren(children, idx)
      };
    }
  }

  render() {
    const { value, children } = this.props;
    return value.map((item, idx) => this.cloneChildren(isFunc(children) ? children(item, idx, value) : children, idx));
  }

}

FormReplicator.propTypes = {
  // Nested props
  name: PropTypes.string,
  onChange: PropTypes.func,
  // Un-nested props
  value: PropTypes.array,
  children: PropTypes.oneOfType([
    PropTypes.node,
    PropTypes.func
  ])
};
