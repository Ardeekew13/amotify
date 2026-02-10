"use client";

import React from 'react';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { ConfigProvider, App } from 'antd';
import { antdTheme } from './antd-theme';

export function AntdProvider({ children }: { children: React.ReactNode }) {
  return (
    <AntdRegistry>
      <ConfigProvider theme={antdTheme}>
        <App>
          {children}
        </App>
      </ConfigProvider>
    </AntdRegistry>
  );
}
