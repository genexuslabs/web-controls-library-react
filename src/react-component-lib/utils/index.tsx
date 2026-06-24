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

import type { StyleReactProps } from '../interfaces';

type Mutable<T> = { -readonly [P in keyof T]-?: T[P] }; // Remove readonly and ?

export type StencilReactExternalProps<PropType, ElementType> = PropType &
  Omit<React.HTMLAttributes<ElementType>, 'style'> &
  StyleReactProps;

// The comma in the type is to trick typescript because it things a single generic in a tsx file is jsx
export const mergeRefs = <ElementType,>(...refs: React.Ref<ElementType>[]) => (
  value: ElementType,
) =>
  refs.forEach((ref) => {
    if (typeof ref === 'function') {
      ref(value);
    } else if (ref != null) {
      // This is typed as readonly so we need to allow for override
      (ref as Mutable<React.RefObject<ElementType>>).current = value;
    }
  });

export const createForwardRef = <PropType, ElementType>(
  ReactComponent: any,
  displayName: string,
) => {
  const forwardRef = (
    props: StencilReactExternalProps<PropType, ElementType>,
    ref: React.Ref<ElementType>,
  ) => {
    return <ReactComponent {...props} forwardedRef={ref} />;
  };
  forwardRef.displayName = displayName;

  return React.forwardRef(forwardRef);
};

export * from './attachProps';
export * from './case';
