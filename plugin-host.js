// lol-client v5 Host half — DOM 自检接收器 + 查询工具
// 与 plugin-client.js 配套。此半注册私有 RPC 接收器(lolc.probe.report)
// 与动态 Tool(lolc_dom_report),让模型无需截图即可读取真实交互自检数据。
let reports = []

return {
  apply(ctx) {
    harness.handle('lolc.probe.report', async (args) => {
      if (args && typeof args === 'object') {
        reports.push(args)
        if (reports.length > 200) reports.splice(0, reports.length - 200)
      }
      return { ok: true, stored: reports.length }
    })

    harness.registerTool(ctx, harness.defineTool({
      name: 'lolc_dom_report',
      description: 'Return the DOM self-check reports pushed by the lol-client v5 window (click hits and 2s state snapshots). Lets the model verify real UI interaction without screenshots.',
      parameters: { type: 'object', properties: {}, required: [] },
      output: {
        schema: { type: 'string' },
        render(_args, value) {
          return [{ type: 'text', text: String(value) }]
        },
      },
      timeoutMs: 5000,
      async execute() {
        return JSON.stringify({ stored: reports.length, tail: reports.slice(-40) })
      },
    }))
  },
}