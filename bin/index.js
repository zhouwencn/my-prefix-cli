#!/usr/bin/env node
const fs = require('fs')
const path = require('path')
const { program } = require('commander')
const esprima = require('esprima')
const estraverse = require('estraverse')
const escodegen = require('escodegen')

program
  .name('my-prefix-cli') // 1. 给 CLI 工具命名，显示在帮助信息里
  .description('Add prefix to all variable names in JS file') // 2. 给 CLI 添加描述，也会显示在帮助信息里
  .argument('<inputFile>', 'JS file to process') // 3. 定义一个必填的命令行参数 inputFile，代表要处理的 JS 文件路径，尖括号表示必填
  .option('--prefix <string>', 'Prefix for variable names', '__prefix_') // 4. 定义一个可选参数 --prefix，指定变量名前缀，默认值是 '__prefix_'
  .option('-o, --output <file>', 'Output file path') // 5. 定义一个可选参数 -o 或 --output，指定输出文件路径
  .action((inputFile, options) => {
    // 6. 命令执行时的回调函数，参数 inputFile 是第3步传进来的文件路径，options 是第4和第5步的选项对象
    const fullPath = path.resolve(process.cwd(), inputFile) // 7. 把相对路径 inputFile 解析成绝对路径，基准是当前终端所在的工作目录(process.cwd())
    if (!fs.existsSync(fullPath)) {
      console.error('❌ 输入文件不存在：', fullPath)
      process.exit(1)
    }

    const code = fs.readFileSync(fullPath, 'utf-8')
    const ast = esprima.parseScript(code)
    const variableMap = new Map()

    // 收集变量名和函数参数
    estraverse.traverse(ast, {
      enter(node) {
        if (node.type === 'VariableDeclarator') {
          variableMap.set(node.id.name, options.prefix + node.id.name)
        }
        if (node.type === 'FunctionDeclaration') {
          node.params.forEach((param) => {
            if (param.type === 'Identifier') {
              variableMap.set(param.name, options.prefix + param.name)
            }
          })
        }
      }
    })

    // 替换标识符
    const newAst = estraverse.replace(ast, {
      enter(node) {
        if (node.type === 'Identifier') {
          if (variableMap.has(node.name)) {
            return { ...node, name: variableMap.get(node.name) }
          }
        }
      }
    })

    // 输出新代码
    const output = escodegen.generate(newAst)
    if (options.output) {
      const outputPath = path.resolve(process.cwd(), options.output)
      fs.writeFileSync(outputPath, output, 'utf-8')
      console.log(`✅ 已写入文件：${outputPath}`)
    } else {
      console.log(output)
    }
  })

program.parse()
