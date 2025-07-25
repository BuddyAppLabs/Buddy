const config = {
  /**
   * 热键配置
   * KeyManager 将根据当前环境选择对应的 keycodes 进行监听
   */
  hotkey: {
    // 开发环境: 监听 Option 键 (左58, 右61)
    development: [58, 61],
    // 生产环境: 监听 Command 键 (左54, 右55)
    production: [54, 55],
  },
};

export default config;
