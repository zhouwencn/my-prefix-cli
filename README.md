一个用于处理和分析JavaScript代码的命令行工具，基于AST（抽象语法树）。

## 安装

```bash
npm install -g my-prefix-cli
```

## 使用方法

```bash
my-prefix-cli <options> <file>
```

### 常用参数

| 参数         | 说明           |
| ------------ | -------------- |
| `-h, --help` | 显示帮助信息   |
| `-v, --version` | 显示版本号   |

## 示例

```bash
my-prefix-cli input.js --prefix=my_ --output output.js
```
