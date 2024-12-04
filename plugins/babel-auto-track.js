const { declare } = require("@babel/helper-plugin-utils");

const autoTrack = declare((api, options) => {
  api.assertVersion(7);
  return {
    visitor: {
      ExportDefaultDeclaration: {
        enter(path, state) {
          if (state.filename.includes('.vue') && !state.filename.includes('src/app.vue')) {
            let isHasOnLoad = false;
            path.traverse({
              ObjectMethod(curPath) {
                if (curPath.node.key.name === 'onLoad') {
                  isHasOnLoad = true;
                  const isHasConsole = curPath.node.body.body.some((item) => {
                    const object = item?.expression?.callee?.object || {};
                    if (object.type === 'Identifier' && object.name === 'console') {
                      return true;
                    }
                    return false;
                  });
                  if (!isHasConsole) {
                    const body = curPath.get('body');
                    const newNode = api.template.statement('console.log(getCurrentPages())')();
                    body.insertAfter(newNode);
                  }
                }
              },
            });
            if (!isHasOnLoad) {
              const properties = path.node.declaration.properties;
              const newNode = api.template.statement('console.log(getCurrentPages())')();
              const objectMethod = api.types.objectMethod('method', api.types.identifier('onLoad'), [api.types.identifier('query')], api.types.blockStatement([newNode]));
              properties.push(objectMethod);
            }
          }
        },
      },
    },
  };
});

module.exports = autoTrack;