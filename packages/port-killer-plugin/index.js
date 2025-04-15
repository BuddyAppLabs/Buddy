const { exec } = require('child_process');

// 插件信息
const plugin = {
  name: '端口进程管理',
  description: '管理端口占用进程，支持快速结束指定端口的进程',
  version: '1.0.0',
  author: 'Coffic',

  /**
   * 获取插件提供的动作列表
   * @param {Object} context 插件上下文
   * @param {string} context.keyword 搜索关键词
   * @param {string} context.overlaidApp 被覆盖应用名称
   * @returns {Promise<Array>} 动作列表
   */
  async getActions({ keyword = '', overlaidApp = '' }) {
    const portRegex = /^[0-9]{1,5}$/;
    if (portRegex.test(keyword)) {
      return [
        {
          id: 'killPort',
          title: `结束端口 ${keyword} 的进程`,
          description: '终止占用该端口的进程',
          icon: '🔌',
          params: { port: keyword },
        },
      ];
    }

    return [];
  },

  /**
   * 执行插件动作
   * @param {Object} action 要执行的动作
   * @returns {Promise<any>} 动作执行结果
   */
  async executeAction(action) {
    if (action.id === 'killPort') {
      const port = action.params.port;
      const cmd =
        process.platform === 'win32'
          ? `netstat -ano | findstr :${port}`
          : `lsof -i :${port}`;

      return new Promise((resolve, reject) => {
        exec(cmd, (error, stdout) => {
          if (error) {
            reject(error);
            return;
          }

          const lines = stdout.split('\n');
          if (lines.length > 0) {
            const pid =
              process.platform === 'win32'
                ? lines[0].split(/\s+/)[4]
                : lines[1]?.split(/\s+/)[1];

            if (pid) {
              exec(`kill -9 ${pid}`, (error) => {
                if (error) {
                  reject(error);
                } else {
                  resolve({
                    success: true,
                    message: `成功终止端口 ${port} 的进程`,
                  });
                }
              });
            } else {
              resolve({
                success: false,
                message: `未找到占用端口 ${port} 的进程`,
              });
            }
          }
        });
      });
    }
  },
};

// 导出插件
module.exports = plugin;
