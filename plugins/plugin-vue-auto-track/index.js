/**
 * vue自动注入生命周期埋点插件
 */
const { declare } = require("@babel/helper-plugin-utils");
const { checkValueInArray } = require('./utils');

const autoTrack = declare((api, options) => {
  // 需要注入的生命周期和需要注入生命周期的vue文件
  const { lifeCycles = [], fileList = []} = options

  api.assertVersion(7);
  return {
    visitor: {
      ExportDefaultDeclaration: {
        enter(path, state) {
          if (state.filename.includes('.vue') && checkValueInArray(state.filename, fileList)) {
            let isHasLifeCycles = false;
            path.traverse({
              ObjectMethod(curPath) {
                // 判断是否存在生命周期函数
                const index = lifeCycles.includes((item) => {
                  return item.lifeCycleName === curPath.node.key.name;
                });
                if (index > -1) {
                  const {
                    funcIdentifier,
                    funcBody,
                  } = lifeCycles[index];
                  isHasLifeCycles = true;
                  // 判断是否已经有对应埋点
                  const isHasFunc = curPath.node.body.body.some((item) => {
                    const object = item?.expression?.callee?.object || {};
                    if (object.type === 'Identifier' && object.name === funcIdentifier) {
                      return true;
                    }
                    return false;
                  });
                  // 不存在埋点则注入埋点函数
                  if (!isHasFunc) {
                    const body = curPath.get('body');
                    const newNode = api.template.statement(funcBody);
                    body.insertAfter(newNode);
                  }
                }
              },
            });
            // 不存在对应生命周期则注入生命周期和埋点
            if (!isHasLifeCycles) {
              const properties = path.node.declaration.properties;
              lifeCycles.forEach(lifeCycle => {
                const { lifeCycleName, funcBody } = lifeCycle;
                const newNode = api.template.statement(funcBody);
                const objectMethod = api.types.objectMethod('method', api.types.identifier(lifeCycleName), [], api.types.blockStatement([newNode]));
                properties.push(objectMethod);
              })
            }
          }
        },
      },
    },
  };
});

module.exports = autoTrack;