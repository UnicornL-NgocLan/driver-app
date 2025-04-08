export async function hangeChangeUserCompany(odoo, companyId, uid) {
    return new Promise((resolve, reject) => {
        const inParams = [];
        inParams.push([uid]); 
        inParams.push({ company_id: parseInt(companyId) });
        const params = [];
        params.push(inParams);
        odoo.execute_kw("res.users", "write", params, function (err, user) {
            if (err) {
                reject(err);
            } else {
                resolve(user);
            }
        });
    });
}

export async function updateActualEndDate(odoo, data, uid) {
    return new Promise((resolve, reject) => {
        const inParams = [];
        inParams.push([parseInt(uid)]); 
        inParams.push(data);
        const params = [];
        params.push(inParams);
        odoo.execute_kw("sea.transport.line", "write", params, function (err, user) {
            if (err) {
                reject(err);
            } else {
                resolve(user);
            }
        });
    });
}


export async function doneTransportLine(odoo, uid) {
    return new Promise((resolve, reject) => {
        let params = [];
        params.push([parseInt(uid)]);
        odoo.execute_kw("sea.transport.line", "done_transport_line", params, function (err, user) {
            if (err) {
                reject(err);
            } else {
                resolve(user);
            }
        });
    });
}


export async function cancelTransportLine(odoo, uid) {
    return new Promise((resolve, reject) => {
        let params = [];
        params.push([parseInt(uid)]);
        odoo.execute_kw("sea.transport.line", "cancel_transport_line", params, function (err, user) {
            if (err) {
                reject(err);
            } else {
                resolve(user);
            }
        });
    });
}

export async function updateSequenceAndStatusTransportLine(odoo, data, uid) {
    return new Promise((resolve, reject) => {
        const inParams = [];
        inParams.push([parseInt(uid)]); 
        inParams.push(data);
        const params = [];
        params.push(inParams);
        odoo.execute_kw("sea.transport.line", "write", params, function (err, user) {
            if (err) {
                reject(err);
            } else {
                resolve(user);
            }
        });
    });
}
