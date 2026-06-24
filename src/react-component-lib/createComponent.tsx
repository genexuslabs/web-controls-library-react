// Copyright 2020 GeneXus S.A.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import React from 'react';

import {
  attachProps,
  createForwardRef,
  dashToPascalCase,
  isCoveredByReact,
  mergeRefs,
} from './utils';

export interface HTMLStencilElement extends HTMLElement {
  componentOnReady(): Promise<this>;
}

interface StencilReactInternalProps<ElementType> extends React.HTMLAttributes<ElementType> {
  forwardedRef: React.RefObject<ElementType>;
  ref?: React.Ref<any>;
}

export const createReactComponent = <
  PropType,
  ElementType extends HTMLStencilElement,
  ContextStateType = {},
  ExpandedPropsTypes = {}
>(
  tagName: string,
  ReactComponentContext?: React.Context<ContextStateType>,
  manipulatePropsFunction?: (
    originalProps: StencilReactInternalProps<ElementType>,
    propsToPass: any,
  ) => ExpandedPropsTypes,
) => {
  const displayName = dashToPascalCase(tagName);

  const ReactComponent = class extends React.Component<StencilReactInternalProps<ElementType>> {
    componentEl!: ElementType;

    setComponentElRef = (element: ElementType) => {
      this.componentEl = element;
    };

    constructor(props: StencilReactInternalProps<ElementType>) {
      super(props);
    }

    componentDidMount() {
      this.componentDidUpdate(this.props);
    }

    componentDidUpdate(prevProps: StencilReactInternalProps<ElementType>) {
      attachProps(this.componentEl, this.props, prevProps);
    }

    render() {
      const { children, forwardedRef, style, className, ref, ...cProps } = this.props;

      let propsToPass = Object.keys(cProps).reduce((acc, name) => {
        if (name.indexOf('on') === 0 && name[2] === name[2].toUpperCase()) {
          const eventName = name.substring(2).toLowerCase();
          if (typeof document !== 'undefined' && isCoveredByReact(eventName, document)) {
            (acc as any)[name] = (cProps as any)[name];
          }
        } else {
          (acc as any)[name] = (cProps as any)[name];
        }
        return acc;
      }, {});

      if (manipulatePropsFunction) {
        propsToPass = manipulatePropsFunction(this.props, propsToPass);
      }

      let newProps: Omit<StencilReactInternalProps<ElementType>, 'forwardedRef'> = {
        ...propsToPass,
        ref: mergeRefs(forwardedRef, this.setComponentElRef),
        style,
      };

      return React.createElement(tagName, newProps, children);
    }

    static get displayName() {
      return displayName;
    }
  };

  // If context was passed to createReactComponent then conditionally add it to the Component Class
  if (ReactComponentContext) {
    ReactComponent.contextType = ReactComponentContext;
  }

  return createForwardRef<PropType, ElementType>(ReactComponent, displayName);
};
