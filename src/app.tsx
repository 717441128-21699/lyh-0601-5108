import React, { useEffect } from 'react';
import { useDidShow, useDidHide } from '@tarojs/taro';
import './app.scss';
import useAppStore from '@/store';

function App(props) {
  const initStore = useAppStore((s) => s.initStore);

  useEffect(() => {
    initStore();
  }, [initStore]);

  useDidShow(() => {
    initStore();
  });

  useDidHide(() => {});

  return props.children;
}

export default App;
