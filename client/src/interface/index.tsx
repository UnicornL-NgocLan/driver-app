export interface ICompany {
    id:number,
    name:string,
    short_name:string,
}

export interface ITransportLine {
    address_end: string,
    address_start: string,
    id: number,
    item_type:string,
    name: string,
    partner_id: any,
    state:string,
    transport_id:[],
    date_end_actual:string,
    note:string,
}

export interface ITransport {
    id:number,
    name:string,
    state:string,
    vehicle_id:any,
    date_start_actual:string,
    sea_driver_id:any,
}

export interface IVehicle {
    id:number,
    license_plate: string,
    brand_id: any,
    odometer: number,
    is_on_mission:boolean,
    image:string,
}