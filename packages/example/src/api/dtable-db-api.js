import axios from 'axios';

class DTableDbAPI {

  constructor() {
    this.req = null;
  }

  init() {
    if (this.req) return;
    const { accessToken, dtableDb } = window.dtable ? window.dtable : window.seafileConfig;
    this.req = axios.create({
      baseURL: dtableDb,
      headers: { 'Authorization': 'Token ' + accessToken }
    });
  }

  sqlQuery(sql, parameters, convert_keys = false) {
    this.init();
    const { dtableUuid } = window.dtable ? window.dtable : window.seafileConfig;
    const url = `/api/v2/dtables/${dtableUuid}/sql/`;
    let data = { sql: sql, convert_keys };
    if (parameters) {
      data['parameters'] = parameters;
    }
    return this.req.post(url, data);
  }

}

const dtableDbAPI = new DTableDbAPI();

export default dtableDbAPI;
