// Test-only API context; never executes workspace code.
exports.activate = context => ({globalStorageUri: context.globalStorageUri});
