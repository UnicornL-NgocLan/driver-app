export async function getUserData(odoo, uid) {
    return new Promise((resolve, reject) => {
      const params = [[['id', '=', uid]], ['id', 'name', 'company_ids', 'company_id', 'email','partner_id']];
      odoo.execute_kw('res.users', 'search_read', [params], (err, user) => {
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
        odoo.execute_kw("res.company", 'search_read', params, (err, companies) => {
            if (err) {
            reject(err);
            } else {
            resolve(companies);
            }
        });
    });
}

export async function getAllActiveTransport(odoo,company_id) {
  return new Promise((resolve, reject) => {
      const inParams = [];
      inParams.push([["company_id","=",parseInt(company_id)],["state","=","start"]]); 
      inParams.push([
        "id","name","state","vehicle_id","date_start_actual","sea_driver_id"
      ]); 
      inParams.push(0); //offset
      inParams.push(1); //limit
      const params = [];
      params.push(inParams);
      odoo.execute_kw("sea.transport", 'search_read', params, (err, assets) => {
          if (err) {
          reject(err);
          } else {
          resolve(assets);
          }
      });
  });
}

export async function getAllMyTransports(odoo,company_id) {
  return new Promise((resolve, reject) => {
      const inParams = [];
      inParams.push([["company_id","=",parseInt(company_id)],["state","in",["start","done","cancel"]]]); 
      inParams.push([
        "id","name","state","vehicle_id","date_start_actual","sea_driver_id"
      ]); 
      inParams.push(0); 
      const params = [];
      params.push(inParams);
      odoo.execute_kw("sea.transport", 'search_read', params, (err, assets) => {
          if (err) {
          reject(err);
          } else {
          resolve(assets);
          }
      });
  });
}


export async function getAllTransportLine(odoo,id,getAll=false) {
  const condition = getAll ? ["ready","start","done","cancel"] : ["ready","start"];
  return new Promise((resolve, reject) => {
      const inParams = [];
      inParams.push([["transport_id","=",parseInt(id)],["state","in",condition]]); 
      inParams.push([
        "id","name","state","item_type","partner_id","address_start","address_end","transport_id","date_end_actual","note"
      ]); 
      inParams.push(0); 
      const params = [];
      params.push(inParams);
      odoo.execute_kw("sea.transport.line", 'search_read', params, (err, assets) => {
          if (err) {
          reject(err);
          } else {
          resolve(assets);
          }
      });
  });
}

export async function getSeaDriver(odoo,id,company_id) {
  return new Promise((resolve, reject) => {
      const inParams = [];
      inParams.push([["company_id","=",parseInt(company_id)],["partner_id","=",parseInt(id)]]); 
      inParams.push(["id"]); 
      inParams.push(0); 
      const params = [];
      params.push(inParams);
      odoo.execute_kw("sea.driver", 'search_read', params, (err, assets) => {
          if (err) {
          reject(err);
          } else {
          resolve(assets);
          }
      });
  });
}

export async function getAllSeaDriver(odoo,company_id) {
  return new Promise((resolve, reject) => {
      const inParams = [];
      inParams.push([["company_id","=",parseInt(company_id)]]); 
      inParams.push(["id","name"]); 
      inParams.push(0); 
      const params = [];
      params.push(inParams);
      odoo.execute_kw("sea.driver", 'search_read', params, (err, assets) => {
          if (err) {
          reject(err);
          } else {
          resolve(assets);
          }
      });
  });
}

export async function checkCurrentTransportLineIsDone(odoo,id) {
  return new Promise((resolve, reject) => {
      const inParams = [];
      inParams.push([["id","=",parseInt(id)],["state","in",["done","cancel","ready"]]]); 
      inParams.push(["id"]); 
      inParams.push(0); 
      const params = [];
      params.push(inParams);
      odoo.execute_kw("sea.transport.line", 'search_read', params, (err, assets) => {
          if (err) {
          reject(err);
          } else {
          resolve(assets);
          }
      });
  });
}

export async function checkCurrentTransportLineIsReady(odoo,id) {
  return new Promise((resolve, reject) => {
      const inParams = [];
      inParams.push([["id","=",parseInt(id)],["state","in",["done","cancel","start"]]]); 
      inParams.push(["id"]); 
      inParams.push(0); 
      const params = [];
      params.push(inParams);
      odoo.execute_kw("sea.transport.line", 'search_read', params, (err, assets) => {
          if (err) {
          reject(err);
          } else {
          resolve(assets);
          }
      });
  });
}


export async function getAllVehicles(odoo,company_id) {
  return new Promise((resolve, reject) => {
    const inParams = [];
      inParams.push([["active","=",true],]); 
      inParams.push(["license_plate","brand_id","odometer","is_on_mission","image"]); 
      inParams.push(0); 
      const params = [];
      params.push(inParams);
      odoo.execute_kw("fleet.vehicle", 'search_read', params, (err, assets) => {
          if (err) {
          reject(err);
          } else {
          resolve(assets);
          }
      });
  });
}

