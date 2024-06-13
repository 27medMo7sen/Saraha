export const emailTemplate = ({ link, linkData, subject }) => {
  return `<!DOCTYPE html>
<html>
  <head>
    <link
      rel="stylesheet"
      href="https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css"
    />
  </head>
  <style type="text/css">
    body {
      background-color: #88bdbf;
      margin: 0px;
    }
  </style>
  <body style="margin: 0px">
    <table
      border="0"
      width="50%"
      style="
        margin: auto;
        padding: 30px;
        background-color: #f3f3f3;
        border: 1px solid #630e2b;
      "
    >
      <tr>
        <td>
          <table border="0" width="100%">
            <tr>
              <td>
                <h1>
                  <img
                    width="100px"
                    src="https://res.cloudinary.com/doou4eolq/image/upload/v1718214887/olyo7enx68khberteet3.png"
                  />
                </h1>
              </td>
              <td>
                <p style="text-align: right">
                  <a
                    href="http://localhost:4200/#/"
                    target="_blank"
                    style="text-decoration: none"
                    >View In Website</a
                  >
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td>
          <table
            border="0"
            cellpadding="0"
            cellspacing="0"
            style="text-align: center; width: 100%; background-color: #fff"
          >
            <tr>
              <td
                style="
                  background-color: black;
                  height: 100px;
                  font-size: 50px;
                  color: #fff;
                "
              >
                <img
                  width="75px"
                  height="75px"
                  src="https://res.cloudinary.com/doou4eolq/image/upload/v1718216339/horq2hqikxh7wrn1renf.png"
                />
              </td>
            </tr>
            <tr>
              <td>
                <h1 style="padding-top: 25px; color: black">${subject}</h1>
              </td>
            </tr>
            <tr>
              <td>
                <p style="padding: 0px 100px"></p>
              </td>
            </tr>
            <tr>
              <td>
                <a
                  href="${link}"
                  style="
                    margin: 10px 0px 30px 0px;
                    border-radius: 4px;
                    padding: 10px 20px;
                    border: 0;
                    color: #fff;
                    font-weight: 600;
                    background-color: black;
                  "
                  >${linkData}</a
                >
              </td>
            </tr>
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
            <tr></tr>
          </table>
        </td>
      </tr>
      <tr>
        <td>
          <table
            border="0"
            width="100%"
            style="border-radius: 5px; text-align: center"
          >
            <tr>
              <td>
                <h3 style="margin-top: 10px; color: #000">Stay in touch</h3>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`;
};
