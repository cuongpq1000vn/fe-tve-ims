"use server";
import { ApiResponse } from "@/types";
import { ENV } from "@/constants";
import { AddTokenDTO } from "@/dtos/token/request";
import { UserDTO } from "@/dtos/token";

export const getToken = async (
  userId: string
): Promise<ApiResponse<UserDTO>> => {
  const requestId = `${crypto.randomUUID()}`;
  const response = await fetch(
    `${ENV.API_URL}/api/public/user/refresh-token/${requestId}?userId=${userId}`,
    {
      method: "GET",
      headers: {
        "x-access-token": ENV.DEFAULT_TOKEN,
        "content-type": "application/json",
      },
      cache: "no-store",
    }
  );
  if (response.status !== 200) {
    console.log(response);

    return {
      status: response.status,
      message: response.statusText,
    };
  }

  const blog = (await response.json()) as UserDTO;

  return {
    status: response.status,
    message: response.statusText,
    data: blog,
  };
};

export const addToken = async (
  accessToken: string,
  addTokenDTO: AddTokenDTO
): Promise<ApiResponse<UserDTO>> => {
  const requestId = `add-token-${crypto.randomUUID()}`;
  const response = await fetch(
    `${ENV.API_URL}/api/auth/refresh-token/${requestId}`,
    {
      method: "POST",
      headers: {
        "x-access-token": accessToken,
        "content-type": "application/json",
      },
      body: JSON.stringify(addTokenDTO),
      cache: "no-store",
    }
  );
  if (response.status !== 200) {
    console.log(response);
    return {
      status: response.status,
      message: response.statusText,
    };
  }

  const blog = (await response.json()) as UserDTO;

  return {
    status: response.status,
    message: response.statusText,
    data: blog,
  };
};

export async function verifyToken(
  accessToken: string
): Promise<ApiResponse<void>> {
  const requestId = `${crypto.randomUUID()}`;
  try {
    const response = await fetch(
      `${ENV.API_URL}/api/public/user/verify/${requestId}`,
      {
        method: "POST",
        body: JSON.stringify({ token: accessToken }),
        headers: { "content-type": "application/json" },
      }
    );

    if (!response.ok) {
      return {
        status: response.status,
        message: "Failed",
      };
    }

    return {
      status: 200,
      message: "ok",
    };
  } catch (e) {
    console.log(e);

    return { message: "Failed to fetch", status: 500 };
  }
}
