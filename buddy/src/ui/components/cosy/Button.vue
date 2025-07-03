<!--
Button 组件

一个基于 DaisyUI 的按钮组件，提供丰富的样式和功能选项。

使用示例：
```vue
<Button>默认按钮</Button>
<Button variant="primary">主要按钮</Button>
<Button variant="ghost">幽灵按钮</Button>
<Button variant="ghost" size="sm">小型幽灵按钮</Button>
<Button loading>加载中按钮</Button>
<Button disabled>禁用按钮</Button>
```

事件：
- click: 点击按钮时触发（disabled或loading状态下不触发）

Props:
- variant: 按钮变体，支持颜色和样式变体
  颜色变体: neutral | primary | secondary | accent | info | success | warning | error
  样式变体: outline | dash | soft | ghost | link
- color: 按钮颜色（variant的别名，仅支持颜色变体）
- style: 按钮样式（已废弃，请使用variant）
- size: 按钮大小
- shape: 按钮形状
- loading: 是否显示加载状态
- disabled: 是否禁用
- active: 是否激活
-->

<script setup lang="ts">
  import { computed } from 'vue';

  // 颜色变体类型
  type ColorVariant =
    | 'neutral'
    | 'primary'
    | 'secondary'
    | 'accent'
    | 'info'
    | 'success'
    | 'warning'
    | 'error';
  // 样式变体类型
  type StyleVariant = 'outline' | 'dash' | 'soft' | 'ghost' | 'link';
  // 所有可能的变体类型
  type Variant = ColorVariant | StyleVariant;

  interface Props {
    // variant支持所有变体类型
    variant?: Variant;
    // 按钮颜色（向后兼容）
    color?: ColorVariant;
    // 按钮样式（已废弃，请使用variant）
    style?: StyleVariant;
    // 按钮大小
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    // 按钮形状
    shape?: 'wide' | 'block' | 'square' | 'circle';
    // 是否显示加载状态
    loading?: boolean;
    // 是否禁用
    disabled?: boolean;
    // 是否激活
    active?: boolean;
  }

  const props = withDefaults(defineProps<Props>(), {
    variant: undefined,
    color: undefined,
    style: undefined,
    size: 'md',
    shape: undefined,
    loading: false,
    disabled: false,
    active: false,
  });

  const emit = defineEmits<{
    (e: 'click', event: MouseEvent): void;
  }>();

  const handleClick = (event: MouseEvent) => {
    if (!props.disabled && !props.loading) {
      emit('click', event);
    }
  };

  // 判断是否为颜色变体
  const isColorVariant = (variant: Variant): variant is ColorVariant => {
    return [
      'neutral',
      'primary',
      'secondary',
      'accent',
      'info',
      'success',
      'warning',
      'error',
    ].includes(variant);
  };

  // 判断是否为样式变体
  const isStyleVariant = (variant: Variant): variant is StyleVariant => {
    return ['outline', 'dash', 'soft', 'ghost', 'link'].includes(variant);
  };

  // 获取最终的颜色变体
  const buttonColor = computed(() => {
    if (props.color) return props.color;
    if (props.variant && isColorVariant(props.variant)) return props.variant;
    return undefined;
  });

  // 获取最终的样式变体
  const buttonStyle = computed(() => {
    if (props.style) return props.style;
    if (props.variant && isStyleVariant(props.variant)) return props.variant;
    return undefined;
  });

  const classes = computed(() => {
    return [
      'btn',
      'no-drag-region',
      // 颜色类 - 显式列出所有可能的类名
      {
        'btn-neutral': buttonColor.value === 'neutral',
        'btn-primary': buttonColor.value === 'primary',
        'btn-secondary': buttonColor.value === 'secondary',
        'btn-accent': buttonColor.value === 'accent',
        'btn-info': buttonColor.value === 'info',
        'btn-success': buttonColor.value === 'success',
        'btn-warning': buttonColor.value === 'warning',
        'btn-error': buttonColor.value === 'error',
      },
      // 样式类 - 显式列出所有可能的类名
      {
        'btn-outline': buttonStyle.value === 'outline',
        'btn-dash': buttonStyle.value === 'dash',
        'btn-soft': buttonStyle.value === 'soft',
        'btn-ghost': buttonStyle.value === 'ghost',
        'btn-link': buttonStyle.value === 'link',
      },
      // 大小类 - 显式列出所有可能的类名
      {
        'btn-xs': props.size === 'xs',
        'btn-sm': props.size === 'sm',
        'btn-md': props.size === 'md',
        'btn-lg': props.size === 'lg',
        'btn-xl': props.size === 'xl',
      },
      // 形状类 - 显式列出所有可能的类名
      {
        'btn-square': props.shape === 'square',
        'btn-circle': props.shape === 'circle',
      },
      // 状态类
      {
        'btn-active': props.active,
        'btn-disabled': props.disabled,
        loading: props.loading,
      },
    ];
  });
</script>

<template>
  <button :class="classes" :disabled="disabled || loading" @click="handleClick">
    <slot></slot>
  </button>
</template>
