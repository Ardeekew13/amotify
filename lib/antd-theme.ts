import type { ThemeConfig } from 'antd';

export const antdTheme: ThemeConfig = {
  token: {
    // Base colors - Black and White
    colorBgBase: '#ffffff',
    colorTextBase: '#000000',
    
    // Primary color - Green (for primary actions)
    colorPrimary: '#22c55e', // green-500
    colorPrimaryHover: '#16a34a', // green-600
    colorPrimaryActive: '#15803d', // green-700
    
    // Info color - Blue
    colorInfo: '#3b82f6', // blue-500
    colorInfoHover: '#2563eb', // blue-600
    
    // Warning color - Yellow
    colorWarning: '#eab308', // yellow-500
    colorWarningHover: '#ca8a04', // yellow-600
    
    // Success - Green
    colorSuccess: '#22c55e', // green-500
    
    // Error - Red
    colorError: '#ef4444', // red-500
    
    // Border and background
    colorBorder: '#e5e7eb', // gray-200
    colorBorderSecondary: '#f3f4f6', // gray-100
    colorBgContainer: '#ffffff',
    colorBgElevated: '#ffffff',
    colorBgLayout: '#f9fafb', // gray-50
    
    // Text colors
    colorText: '#000000',
    colorTextSecondary: '#6b7280', // gray-500
    colorTextTertiary: '#9ca3af', // gray-400
    colorTextQuaternary: '#d1d5db', // gray-300
    
    // Border radius
    borderRadius: 6,
    borderRadiusLG: 8,
    borderRadiusSM: 4,
    
    // Font
    fontSize: 14,
    fontSizeHeading1: 38,
    fontSizeHeading2: 30,
    fontSizeHeading3: 24,
    fontSizeHeading4: 20,
    fontSizeHeading5: 16,
    
    // Line height
    lineHeight: 1.5715,
    
    // Control height
    controlHeight: 40,
    controlHeightLG: 48,
    controlHeightSM: 32,
  },
  components: {
    Button: {
      primaryColor: '#ffffff',
      defaultBorderColor: '#e5e7eb',
      defaultColor: '#000000',
      controlHeight: 40,
      fontSize: 14,
      borderRadius: 6,
    },
    Input: {
      controlHeight: 40,
      fontSize: 14,
      borderRadius: 6,
      colorBorder: '#e5e7eb',
      colorBgContainer: '#ffffff',
    },
    Select: {
      controlHeight: 40,
      fontSize: 14,
      borderRadius: 6,
    },
    Table: {
      headerBg: '#f9fafb',
      headerColor: '#000000',
      borderColor: '#e5e7eb',
      rowHoverBg: '#f3f4f6',
      fontSize: 14,
    },
    Card: {
      borderRadiusLG: 8,
      colorBorderSecondary: '#e5e7eb',
    },
    Menu: {
      itemBg: '#ffffff',
      itemColor: '#000000',
      itemHoverBg: '#f3f4f6',
      itemHoverColor: '#22c55e',
      itemSelectedBg: '#f0fdf4', // green-50
      itemSelectedColor: '#22c55e',
      itemActiveBg: '#dcfce7', // green-100
    },
    Layout: {
      headerBg: '#ffffff',
      headerColor: '#000000',
      bodyBg: '#f9fafb',
      siderBg: '#ffffff',
      triggerBg: '#f3f4f6',
      triggerColor: '#000000',
    },
    Form: {
      labelColor: '#000000',
      labelFontSize: 14,
      itemMarginBottom: 20,
    },
    Modal: {
      headerBg: '#ffffff',
      contentBg: '#ffffff',
      titleColor: '#000000',
    },
    Notification: {
      colorBgElevated: '#ffffff',
      colorText: '#000000',
    },
    Message: {
      contentBg: '#ffffff',
    },
    Tabs: {
      itemColor: '#6b7280',
      itemHoverColor: '#000000',
      itemSelectedColor: '#22c55e',
      itemActiveColor: '#22c55e',
      inkBarColor: '#22c55e',
    },
    Badge: {
      colorPrimary: '#22c55e',
      colorInfo: '#3b82f6',
      colorWarning: '#eab308',
      colorError: '#ef4444',
    },
  },
};
