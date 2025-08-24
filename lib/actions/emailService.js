"use server";

import { auth } from "@/auth";

const EMAIL_BASE_URL =
  process.env.EMAIL_BASE_URL || "https://example.com/api/email";
const EMAIL_API_KEY = process.env.EMAIL_API_KEY || "your-email-api-key";

export const sendGroupEmail = async (emailData) => {
  const session = await auth();
  if (!session) {
    return {
      status: "ERROR",
      error: "Not signed in",
    };
  }

  try {
    const templatename = emailData.templateName || "default-template";
    const groupName = emailData.groupName || "Default Group";
    const tempplateData = emailData.templateData || {};

    if (!templatename || !groupName) {
      return {
        status: "ERROR",
        error: "Template name and group name are required",
      };
    }

    // Check if EMAIL_BASE_URL already contains the API path
    const apiUrlPrefix = "/api/services/email";
    const groupEndpoint = EMAIL_BASE_URL.includes(apiUrlPrefix)
      ? `${EMAIL_BASE_URL}/send-group`
      : `${EMAIL_BASE_URL}${apiUrlPrefix}/send-group`;

    console.log("Sending group email to endpoint:", groupEndpoint);

    const response = await fetch(groupEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": `${EMAIL_API_KEY}`,
      },
      body: JSON.stringify({
        templateName: templatename,
        groupName: groupName,
        data: tempplateData,
      }),
    });
    console.log("Group email response status:", response.status);

    if (!response.ok) {
      let errorMessage = "Failed to send group email";
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } catch (parseError) {
        // If response is not JSON, try to get text content
        try {
          const textContent = await response.text();
          console.log("Non-JSON response:", textContent.substring(0, 100));
          errorMessage = `Non-JSON response: ${textContent.substring(
            0,
            100
          )}...`;
        } catch (textError) {
          errorMessage = `Server returned status ${response.status}`;
        }
      }

      return {
        status: "ERROR",
        error: errorMessage,
      };
    }
    const data = await response.json();
    return {
      status: "SUCCESS",
      data: data.data,
      message: data.message || "Group email sent successfully",
    };
  } catch (error) {
    console.error("Error sending group email:", error);
    return {
      status: "ERROR",
      error: error.message || "Failed to send group email",
    };
  }
};

export const sendEmail = async (emailData) => {
  const session = await auth();
  if (!session) {
    return {
      status: "ERROR",
      error: "Not signed in",
    };
  }

  try {
    const { to, templateName, templateData } = emailData;

    if (!to || !templateName) {
      return {
        status: "ERROR",
        error: "Email recipient and template name are required",
      };
    }

    // Check if EMAIL_BASE_URL already contains the API path
    const apiUrlPrefix = "/api/services/email";
    const sendEndpoint = EMAIL_BASE_URL.includes(apiUrlPrefix)
      ? `${EMAIL_BASE_URL}/send`
      : `${EMAIL_BASE_URL}${apiUrlPrefix}/send`;

    console.log("Sending email to endpoint:", sendEndpoint);

    const response = await fetch(sendEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": `${EMAIL_API_KEY}`,
      },
      body: JSON.stringify({
        to,
        templateName,
        data: templateData || {},
      }),
    });

    console.log("Email response status:", response.status);

    if (!response.ok) {
      let errorMessage = "Failed to send email";
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } catch (parseError) {
        // If response is not JSON, try to get text content
        try {
          const textContent = await response.text();
          console.log("Non-JSON response:", textContent.substring(0, 100));
          errorMessage = `Non-JSON response: ${textContent.substring(
            0,
            100
          )}...`;
        } catch (textError) {
          errorMessage = `Server returned status ${response.status}`;
        }
      }

      return {
        status: "ERROR",
        error: errorMessage,
      };
    }

    const data = await response.json();
    return {
      status: "SUCCESS",
      data: data.data,
      message: data.message || "Email sent successfully",
    };
  } catch (error) {
    console.error("Error sending email:", error);
    return {
      status: "ERROR",
      error: error.message || "Failed to send email",
    };
  }
};

export const sendSyscoOrderEmail = async (orderData) => {
  const session = await auth();
  if (!session) {
    return {
      status: "ERROR",
      error: "Not signed in",
    };
  }

  try {
    const { to, items, shiftTime, dateStr, locationName } = orderData;

    if (!to || !items || items.length === 0) {
      return {
        status: "ERROR",
        error: "Email recipient and order items are required",
      };
    }

    // Create simplified table content with only Item Name, Stock No, and Order fields
    const simplifiedTableContent = `
      <table style="width: 100%; border-collapse: collapse; margin-top: 10px; border: 1px solid black;">
        <tr style="border: 1px solid black; background-color: #f3f4f6;">
          <th style="padding: 10px; text-align: left; font-weight: bold;">Item Name</th>
          <th style="padding: 10px; text-align: right; font-weight: bold;">Stock No</th>
          <th style="padding: 10px; text-align: right; font-weight: bold;">Order</th>
        </tr>
        ${items
          .map(
            (item) => `
          <tr style="border: 1px solid black;">
            <td style="padding: 10px; text-align: left;">${
              item.itemName || item.itemId?.name || "N/A"
            }</td>
            <td style="padding: 10px; text-align: right;">${
              item.stockNo || item.itemId?.stockNo || "N/A"
            }</td>
            <td style="padding: 10px; text-align: right;">${
              item.order || "N/A"
            }</td>
          </tr>
        `
          )
          .join("")}
      </table>
    `;

    // Check if EMAIL_BASE_URL already contains the API path
    const apiUrlPrefix = "/api/services/email";
    const sendEndpoint = EMAIL_BASE_URL.includes(apiUrlPrefix)
      ? `${EMAIL_BASE_URL}/send`
      : `${EMAIL_BASE_URL}${apiUrlPrefix}/send`;

    console.log("Sending sysco email to endpoint:", sendEndpoint);

    const response = await fetch(sendEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": `${EMAIL_API_KEY}`,
      },
      body: JSON.stringify({
        to,
        templateName: "order-details", // Use the same template as the group email
        data: {
          logosrc: process.env.LOGO_SRC || "",
          username: session.user.name,
          shiftTime,
          dateStr,
          ordertype: "Sysco",
          locationName,
          year: new Date().getFullYear(),
          tableContent: simplifiedTableContent,
        },
      }),
    });

    console.log("Sysco email response status:", response.status);

    if (!response.ok) {
      let errorMessage = "Failed to send Sysco order email";
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } catch (parseError) {
        // If response is not JSON, try to get text content
        try {
          const textContent = await response.text();
          console.log("Non-JSON response:", textContent.substring(0, 100));
          errorMessage = `Non-JSON response: ${textContent.substring(
            0,
            100
          )}...`;
        } catch (textError) {
          errorMessage = `Server returned status ${response.status}`;
        }
      }

      return {
        status: "ERROR",
        error: errorMessage,
      };
    }

    const data = await response.json();
    return {
      status: "SUCCESS",
      data: data.data,
      message: data.message || "Sysco order email sent successfully",
    };
  } catch (error) {
    console.error("Error sending Sysco order email:", error);
    return {
      status: "ERROR",
      error: error.message || "Failed to send Sysco order email",
    };
  }
};
