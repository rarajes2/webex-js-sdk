import {WebexSDK, HTTP_METHODS} from '../types';
import HttpRequest from './HttpRequest';
import {StationLoginSuccess, StationLogoutResponse, UserStationLogin} from './types';
import {
  AGENT_LOGOUT_FAILED_EVENT,
  AGENT_LOGOUT_SUCCESS_EVENT,
  LOGIN_API,
  LOGOUT_API,
  LOGOUT_EVENT,
  WCC_API_GATEWAY,
} from './constants';

export default class AgentService {
  private webex: WebexSDK;
  private httpRequest: HttpRequest;

  constructor(webex: WebexSDK, httpRequest: HttpRequest) {
    this.webex = webex;
    this.httpRequest = httpRequest;
  }

  public async stationLogin(data: UserStationLogin): Promise<StationLoginSuccess> {
    try {
      const payload = {
        dialNumber: data.dialNumber,
        teamId: data.teamId,
        isExtension: data.isExtension,
        roles: data.roles,
        deviceType: data.deviceType,
        deviceId: data.deviceId,
      };

      const response = await this.httpRequest.sendRequestWithEvent({
        service: WCC_API_GATEWAY,
        resource: LOGIN_API,
        method: HTTP_METHODS.POST,
        payload,
        eventType: 'StationLogin',
        success: ['AgentStationLoginSuccess'],
        failure: ['AgentStationLoginFailed'],
      });

      return response;
    } catch (error) {
      this.webex.logger.error(`Error during station login: ${error}`);

      throw error;
    }
  }

  public async stationLogout(data: {logoutReason: string}): Promise<StationLogoutResponse> {
    try {
      const response = await this.httpRequest.sendRequestWithEvent({
        service: WCC_API_GATEWAY,
        resource: LOGOUT_API,
        method: HTTP_METHODS.PUT,
        payload: data,
        eventType: LOGOUT_EVENT,
        success: [AGENT_LOGOUT_SUCCESS_EVENT],
        failure: [AGENT_LOGOUT_FAILED_EVENT],
      });

      this.webex.logger.log('Station logout success');

      return response;
    } catch (error) {
      this.webex.logger.error(`Station logout failed: ${error}`);

      throw error;
    }
  }
}
