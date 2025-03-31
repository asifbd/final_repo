import { Typography } from "@mui/material";

function ProductMetadata({metadata}) {

  return (
    <div>
      <Typography variant="subtitle1">
        <strong>ID:</strong> {metadata.id}
      </Typography>
      <Typography variant="subtitle1">
        <strong>Title:</strong> {metadata.title}
      </Typography>

      <Typography variant="subtitle1">
        <strong>Category:</strong> {metadata.category}
      </Typography>
      <Typography variant="subtitle1">
        <strong>Sub Category:</strong> {metadata.sub_category}
      </Typography>
      <Typography variant="body2">
        {metadata.description}
      </Typography>

      <Typography variant="subtitle1">
        <strong>Specs:</strong>
      </Typography>
      <ul>
        {Object.entries(metadata).map(([key, value]) => {
          if (key.startsWith("specs.") && value) {
            return (
              <li key={key}>
                <strong>{key.replace("specs.", "")}:</strong> {value}
              </li>
            );
          }
          return null;
        })}
      </ul>
    </div>
  )
}

export default ProductMetadata
