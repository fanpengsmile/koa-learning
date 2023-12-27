const judgeAdminList = (ctx) => {
    if (ctx.request.headers['x-bussiness-id'] !== 'business') {
        return true;
    }
    return false;
};

module.exports = {
    judgeBlackList: judgeAdminList,
};
