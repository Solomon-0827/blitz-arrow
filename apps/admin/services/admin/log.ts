// @ts-ignore
/* eslint-disable */
import request from '@/utils/request';

/** Get message log list GET /v1/admin/log/message/list */
export async function getMessageLogList(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.GetMessageLogListParams,
  options?: { [key: string]: any },
) {
  return request<API.Response & { data?: API.GetMessageLogListResponse }>(
    '/v1/admin/log/message/list',
    {
      method: 'GET',
      params: {
        ...params,
      },
      ...(options || {}),
    },
  );
}
