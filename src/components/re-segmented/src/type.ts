import type { iconType } from '@/components/re-icon/src/types';
import type { Component, VNode } from 'vue';

export interface OptionsType {
  /** 文字 */
  label?: string | (() => VNode | Component);
  /**
   * @description 图标，采用平台内置的 `useRenderIcon` 函数渲染
   */
  icon?: string | Component;
  /** 图标属性、样式配置 */
  iconAttrs?: iconType;
  /** 值 */
  value?: any;
  /** 是否禁用 */
  disabled?: boolean;
  /** `tooltip` 提示 */
  tip?: string;
}
