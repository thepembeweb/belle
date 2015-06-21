"use strict";

/* jslint browser: true */

import React, {Component} from 'react';
import {injectStyles, removeStyle} from '../utils/inject-style';
import {extend, omit, isUndefined, first, last} from "underscore";
import style from '../style/toggle';

function sanitizeChildProperties(properties) {
  let childProperties = omit(properties, [
    'type',
    'style',
    'onChange',
    'onFocus',
    'onBlur',
    'checked',
    'defaultChecked'
  ]);

  return childProperties;
}


/**
 * Toggle component
 */
export default class Toggle extends Component {

  constructor(properties) {
    super(properties);
    let checked = properties.defaultChecked ? properties.defaultChecked : false;
    checked = properties.checked ? properties.checked : checked;

    this.childProperties = sanitizeChildProperties(properties);

    this._mouseMoveEvent  = this._onMouseMove.bind(this);
    this._mouseUpEvent    = this._onMouseUp.bind(this);

    this.state = {
      value : checked
    };

    if(!isUndefined(this.props.children)){
      if(this.props.children.length !== 2){
        console.warn("You must have 2 choices for each toggle.");
      }
      if(first(this.props.children).props.value == last(this.props.children).props.value){
        console.warn("Your Choices must not have the same value.");
      }
    }
  }

  _onClick(event) {
    console.log('on click');
    this._triggerChange(!this.state.value);
  }

  _triggerChange(value) {
    this.setState( { value: value } );

    if (this.props.onChange) {
      this.props.onChange({ target: { value: value }});
    }
  }

  _onMouseDown(event) {
    // check for left mouse button pressed
    if (event.button !== 0) return;

    this._dragStart = event.pageX - (this.state.value ? -style.sliderOffset : 0);

    this.setState({
      isDragging: true,
      sliderOffset: (this.state.value ? -style.sliderOffset : 0)
    });
  }

  _onMouseMove(event) {
    if (!this.state.isDragging) return;

    console.log('on mouse move');

    let difference = event.pageX - this._dragStart;
    if (difference < -style.handle.width || difference > 0) return;

    this._dragEnd = difference;
    this.setState({
      sliderOffset: difference
    });
  }

  _onMouseUp(event) {
    if (this._dragEnd) {
      let state = this._dragEnd > -(style.handle.width / 2);

      this.setState({
        isDragging: false,
        value: state
      });

      this._dragEnd = false;
    } else {
      this.setState( { isDragging: false } );
    }

    this._dragStart = false;
  }

  _onMouseLeave(event) {
    // this._onMouseUp(event);
  }

  render() {

    const computedToggleStyle = extend( {}, style.toggle );
    let computedSliderStyle;
    let handleStyle;

    if(this.state.isDragging){
      computedSliderStyle = extend( {}, style.slider, { left: this.state.sliderOffset, transition: "none" } );
      handleStyle = extend( {}, style.handle, { left: this.state.sliderOffset, transition: "none" } );
    }else{
      computedSliderStyle = extend( {}, style.slider, { left: this.state.value ? 0 : style.sliderOffset } );
      handleStyle = extend( {}, style.handle, { left: this.state.value ? -style.sliderOffset + 1 : -1 } );
    }

    const computedTrueChoice = first(this.props.children) ? first(this.props.children) : "✔";
    const computedFalseChoice = last(this.props.children) ? last(this.props.children) : "✘";

    const computedTrueChoiceStyle = extend( {}, style.check );
    const computedFalseChoiceStyle = extend( {}, style.cross );

    return (
      <div style={ computedToggleStyle }
           onMouseLeave={ this.state.isDragging ? this._onMouseLeave.bind(this) : null }>
        <div style={ style.sliderWrapper}>
          <div className="react-toggle-slider"
               ref="belleToggleSlider"
               style={ computedSliderStyle }>
            <div className="react-toggle-track-check"
                 style={ computedTrueChoiceStyle }
                 onClick={ this._onClick.bind(this) }>
              { computedTrueChoice }
            </div>
            <div className="react-toggle-track-cross"
                 style={ computedFalseChoiceStyle }
                 onClick={ this._onClick.bind(this) }>
              { computedFalseChoice }
            </div>
          </div>
        </div>
        <div className="react-toggle-handle"
             ref="belleToggleHandle"
             style={ handleStyle }
             onClick={ this._onClick.bind(this)}
             onMouseDown={ this._onMouseDown.bind(this) }
             onMouseMove={ this._onMouseMove.bind(this) }
             onMouseUp={ this._onMouseUp.bind(this) }
             onMouseLeave={ this._onMouseLeave.bind(this) } />
      </div>
    );
  }
}

Toggle.displayName = 'Belle Toggle';
