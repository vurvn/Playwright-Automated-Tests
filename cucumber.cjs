module.exports = {
  default: {
    require: ["tests/step-definitions/*.ts"],
    format: ["progress"],
    publishQuiet: true,
    requireModule: ["ts-node/register"],
    paths: ["tests/features/*.feature"],
  },
};
