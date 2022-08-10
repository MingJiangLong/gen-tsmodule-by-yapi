export type CategoryItem = {
    index: number
    name: string
    desc: string
    add_time: number
    up_time: number
    list: ApiItem[]
}

export type ApiItem = {
    query_path: {
        path: string
        params: Array<any>
    }
    edit_uid: number
    status: string
    type: string,
    req_body_is_json_schema: boolean
    res_body_is_json_schema: boolean
    api_opened: boolean
    index: number
    tag: string[]
    _id: number
    method: "POST" | "GET" | "PUT"
    title: string,// 修改用户
    path: string //"/api/AtsAccount/EditAtsAccountInfo",
    req_params: any[]
    req_body_form: any[],
    req_headers: {
        required: string,
        _id: string,
        name: string,
        value: string
    }[]
    req_query: any[],
    req_body_type: string
    res_body_type: string
    res_body: string
    req_body_other: string
    project_id: number
    catid: number
    uid: number
    add_time: number
    up_time: number
    __v: number
    markdown: string
    desc: string
}

/**
 * 最外层一定是object 
 * 必须满足json
 */
export type PropertyObject = {
    $$ref?: string
    properties: {
        [k: string]:
        | PropertyInteger
        | PropertyArray
        | PropertyString
        | PropertyObject
        | PropertyBoolean
    }
    required?: string[]// 当前层级必填项
    title?: string
    type: "object"
    description?: string
}
export type PropertyInteger = {
    type: "integer" | "number"
    description?: string
    maximum?: number
    minimum?: number
    format?: string
    exclusiveMaximum?: boolean
    exclusiveMinimum?: boolean
}
export type PropertyString = {
    example?: string
    type?: 'string'
    description?: string
    pattern?: string
}
export type PropertyArray = {
    description?: string
    type: "array"
    format?: string
    items: Property
}
export type PropertyBoolean = {
    type: "boolean",
    description?: string
}

export type Property =
    | PropertyObject
    | PropertyArray
    | PropertyBoolean
    | PropertyString
    | PropertyInteger

