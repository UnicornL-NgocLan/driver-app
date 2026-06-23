export async function getUserData(odoo, uid) {
  return new Promise((resolve, reject) => {
    const params = [[["id", "=", uid]], ["id", "name", "company_ids", "company_id", "email", "partner_id"]];
    odoo.execute_kw("res.users", "search_read", [params], (err, user) => {
      if (err) {
        reject(err);
      } else {
        resolve(user);
      }
    });
  });
}

export async function getUserCompanies(odoo, user) {
  return new Promise((resolve, reject) => {
    const inParams = [];
    inParams.push([["id", "in", user[0].company_ids]]);
    inParams.push(["id", "name", "short_name"]);
    inParams.push(0);
    const params = [];
    params.push(inParams);
    odoo.execute_kw("res.company", "search_read", params, (err, companies) => {
      if (err) {
        reject(err);
      } else {
        resolve(companies);
      }
    });
  });
}

export async function getAllReadyTransport(odoo, company_id) {
  return new Promise((resolve, reject) => {
    const inParams = [];
    inParams.push([
      ["company_id", "=", parseInt(company_id)],
      ["state", "in", ["ready", "start"]],
    ]);
    inParams.push(["id", "name", "state", "vehicle_id", "sea_driver_id"]);
    inParams.push(0); //offset
    const params = [];
    params.push(inParams);
    odoo.execute_kw("sea.transport", "search_read", params, (err, assets) => {
      if (err) {
        reject(err);
      } else {
        resolve(assets);
      }
    });
  });
}

export async function getAllActiveTransport(odoo, company_id) {
  return new Promise((resolve, reject) => {
    const inParams = [];
    inParams.push([
      ["company_id", "=", parseInt(company_id)],
      ["state", "=", "start"],
    ]);
    inParams.push(["id", "name", "state", "vehicle_id", "date_start_actual", "sea_driver_id"]);
    inParams.push(0); //offset
    inParams.push(1); //limit
    const params = [];
    params.push(inParams);
    odoo.execute_kw("sea.transport", "search_read", params, (err, assets) => {
      if (err) {
        reject(err);
      } else {
        resolve(assets);
      }
    });
  });
}

export async function getAllMyTransports(odoo, company_id) {
  return new Promise((resolve, reject) => {
    const inParams = [];
    inParams.push([
      ["company_id", "=", parseInt(company_id)],
      ["state", "in", ["start", "done", "cancel"]],
    ]);
    inParams.push(["id", "name", "state", "vehicle_id", "date_start_actual", "sea_driver_id"]);
    inParams.push(0);
    const params = [];
    params.push(inParams);
    odoo.execute_kw("sea.transport", "search_read", params, (err, assets) => {
      if (err) {
        reject(err);
      } else {
        resolve(assets);
      }
    });
  });
}

export async function getAllTransportLine(odoo, id, getAll = false) {
  const condition = getAll ? ["ready", "start", "done", "cancel"] : ["ready", "start"];
  return new Promise((resolve, reject) => {
    const inParams = [];
    inParams.push([
      ["transport_id", "=", parseInt(id)],
      ["state", "in", condition],
    ]);
    inParams.push(["id", "name", "state", "item_type", "partner_id", "address_start", "address_end", "transport_id", "date_end_actual", "note", "picking_id"]);
    inParams.push(0);
    const params = [];
    params.push(inParams);
    odoo.execute_kw("sea.transport.line", "search_read", params, (err, assets) => {
      if (err) {
        reject(err);
      } else {
        resolve(assets);
      }
    });
  });
}

export async function getAllTransportLineJustStateAndSequence(odoo, id) {
  return new Promise((resolve, reject) => {
    const inParams = [];
    inParams.push([["transport_id", "=", parseInt(id)]]);
    inParams.push(["id", "sequence", "state"]);
    inParams.push(0);
    const params = [];
    params.push(inParams);
    odoo.execute_kw("sea.transport.line", "search_read", params, (err, assets) => {
      if (err) {
        reject(err);
      } else {
        resolve(assets);
      }
    });
  });
}

export async function getSeaDriver(odoo, id, company_id) {
  return new Promise((resolve, reject) => {
    const inParams = [];
    inParams.push([
      ["company_id", "=", parseInt(company_id)],
      ["partner_id", "=", parseInt(id)],
    ]);
    inParams.push(["id"]);
    inParams.push(0);
    const params = [];
    params.push(inParams);
    odoo.execute_kw("sea.driver", "search_read", params, (err, assets) => {
      if (err) {
        reject(err);
      } else {
        resolve(assets);
      }
    });
  });
}

export async function getAllSeaDriver(odoo, company_id) {
  return new Promise((resolve, reject) => {
    const inParams = [];
    inParams.push([["company_id", "=", parseInt(company_id)]]);
    inParams.push(["id", "name"]);
    inParams.push(0);
    const params = [];
    params.push(inParams);
    odoo.execute_kw("sea.driver", "search_read", params, (err, assets) => {
      if (err) {
        reject(err);
      } else {
        resolve(assets);
      }
    });
  });
}

export async function checkCurrentTransportLineIsDone(odoo, id) {
  return new Promise((resolve, reject) => {
    const inParams = [];
    inParams.push([
      ["id", "=", parseInt(id)],
      ["state", "in", ["done", "cancel", "ready"]],
    ]);
    inParams.push(["id"]);
    inParams.push(0);
    const params = [];
    params.push(inParams);
    odoo.execute_kw("sea.transport.line", "search_read", params, (err, assets) => {
      if (err) {
        reject(err);
      } else {
        resolve(assets);
      }
    });
  });
}

export async function checkCurrentTransportLineIsReady(odoo, id) {
  return new Promise((resolve, reject) => {
    const inParams = [];
    inParams.push([
      ["id", "=", parseInt(id)],
      ["state", "in", ["done", "cancel", "start"]],
    ]);
    inParams.push(["id"]);
    inParams.push(0);
    const params = [];
    params.push(inParams);
    odoo.execute_kw("sea.transport.line", "search_read", params, (err, assets) => {
      if (err) {
        reject(err);
      } else {
        resolve(assets);
      }
    });
  });
}

export async function getAllVehicles(odoo, company_id) {
  return new Promise((resolve, reject) => {
    const inParams = [];
    inParams.push([["active", "=", true]]);
    inParams.push(["license_plate", "brand_id", "odometer", "is_on_mission", "image"]);
    inParams.push(0);
    const params = [];
    params.push(inParams);
    odoo.execute_kw("fleet.vehicle", "search_read", params, (err, assets) => {
      if (err) {
        reject(err);
      } else {
        resolve(assets);
      }
    });
  });
}

export async function getAllOdometers(odoo, vehicle_id) {
  return new Promise((resolve, reject) => {
    const inParams = [];
    inParams.push([["vehicle_id", "=", parseInt(vehicle_id)]]);
    inParams.push(["date", "value", "vehicle_id", "create_uid"]);
    inParams.push(0);
    const params = [];
    params.push(inParams);
    odoo.execute_kw("fleet.vehicle.odometer", "search_read", params, (err, assets) => {
      if (err) {
        reject(err);
      } else {
        resolve(assets);
      }
    });
  });
}

export async function getAllWarningReminder(odoo, company_id) {
  return new Promise((resolve, reject) => {
    const inParams = [];
    inParams.push([["company_id", "=", parseInt(company_id)]]);
    inParams.push(["id", "state", "vehicle_id"]);
    inParams.push(0);
    const params = [];
    params.push(inParams);
    odoo.execute_kw("vehicle.service.reminder", "search_read", params, (err, assets) => {
      if (err) {
        reject(err);
      } else {
        resolve(assets);
      }
    });
  });
}

export async function getAllReminders(odoo, vehicle_id) {
  return new Promise((resolve, reject) => {
    const inParams = [];
    inParams.push([["vehicle_id", "=", parseInt(vehicle_id)]]);
    inParams.push(["id", "state", "due_odometer", "name"]);
    inParams.push(0);
    const params = [];
    params.push(inParams);
    odoo.execute_kw("vehicle.service.reminder", "search_read", params, (err, assets) => {
      if (err) {
        reject(err);
      } else {
        resolve(assets);
      }
    });
  });
}

export async function getTransportLineImages(odoo, transport_line_id) {
  return new Promise((resolve, reject) => {
    const inParams = [];
    inParams.push([["transport_line_id", "=", parseInt(transport_line_id)]]);
    inParams.push([]);
    inParams.push(0);
    const params = [];
    params.push(inParams);
    odoo.execute_kw("sea.transport.line.image", "search_read", params, (err, images) => {
      if (err) {
        reject(err);
      } else {
        resolve(images);
      }
    });
  });
}

export async function getFuelLogList(odoo, vehicle_id) {
  return new Promise((resolve, reject) => {
    const inParams = [];
    inParams.push([["vehicle_id", "=", parseInt(vehicle_id)]]);
    inParams.push(["id", "liter", "is_full", "date", "odometer", "amount", "create_uid", "write_uid", "created_at"]);
    inParams.push(0);
    const params = [];
    params.push(inParams);
    odoo.execute_kw("fleet.vehicle.log.fuel", "search_read", params, (err, assets) => {
      if (err) {
        reject(err);
      } else {
        resolve(assets);
      }
    });
  });
}

export async function getPickingByQR(odoo, qrContent, companyId) {
  return new Promise((resolve, reject) => {
    const inParams = [];
    inParams.push([
      ["name", "=", qrContent],
      ["company_id", "=", parseInt(companyId)],
      ["state", "in", ["confirmed", "assigned"]]
    ]);
    inParams.push(["id", "name", "location_id", "location_dest_id"]);
    inParams.push(0);
    const params = [];
    params.push(inParams);
    odoo.execute_kw("stock.picking", "search_read", params, (err, pickings) => {
      if (err) reject(err);
      else resolve(pickings);
    });
  });
}

export async function getTransportWarehouses(odoo, transportId) {
  return new Promise((resolve, reject) => {
    const inParams = [];
    inParams.push([["id", "=", parseInt(transportId)]]);
    inParams.push(["id", "warehouse_id", "picking_ids"]);
    inParams.push(0);
    const params = [];
    params.push(inParams);
    odoo.execute_kw("sea.transport", "search_read", params, (err, transports) => {
      if (err) reject(err);
      else resolve(transports);
    });
  });
}

export async function getLocationWarehouses(odoo, locationIds) {
  return new Promise((resolve, reject) => {
    const inParams = [];
    inParams.push([["id", "in", locationIds]]);
    inParams.push(["id", "warehouse_id"]);
    inParams.push(0);
    const params = [];
    params.push(inParams);
    odoo.execute_kw("stock.location", "search_read", params, (err, locations) => {
      if (err) reject(err);
      else resolve(locations);
    });
  });
}

export async function getTransportById(odoo, transportId) {
  return new Promise((resolve, reject) => {
    const inParams = [];
    inParams.push([["id", "=", parseInt(transportId)]]);
    inParams.push(["id", "name", "state", "vehicle_id", "sea_driver_id", "date_start_actual"]);
    inParams.push(0);
    const params = [];
    params.push(inParams);
    odoo.execute_kw("sea.transport", "search_read", params, (err, transports) => {
      if (err) reject(err);
      else resolve(transports);
    });
  });
}

export async function getTransportLineByTransportAndPicking(odoo, transportId, pickingId) {
  return new Promise((resolve, reject) => {
    const inParams = [];
    inParams.push([
      ["transport_id", "=", parseInt(transportId)],
      ["picking_id", "=", parseInt(pickingId)],
      ["state", "in", ["ready"]]
    ]);
    inParams.push(["id"]);
    inParams.push(0);
    const params = [];
    params.push(inParams);
    odoo.execute_kw("sea.transport.line", "search_read", params, (err, lines) => {
      if (err) reject(err);
      else resolve(lines);
    });
  });
}

export async function checkActiveTransportLineForPicking(odoo, pickingId,transport_id) {
  return new Promise((resolve, reject) => {
    const inParams = [];
    inParams.push([
      ["picking_id", "=", parseInt(pickingId)],
      ["state", "!=", "cancel"],
      ["transport_id", "=", parseInt(transport_id)]
    ]);
    inParams.push(["id"]);
    inParams.push(0);
    const params = [];
    params.push(inParams);
    odoo.execute_kw("sea.transport.line", "search_read", params, (err, lines) => {
      if (err) reject(err);
      else resolve(lines);
    });
  });
}
