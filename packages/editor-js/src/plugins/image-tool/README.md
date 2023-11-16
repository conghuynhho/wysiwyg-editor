This is an image tool for editor js.
This image tool will custom following technical rule of gogojungle.

Rules:
- lazy image for edit mode, review mode.
- handle retry get image when rate limit error.
- support validate number of image in document, extension image.

# Flow input image
- When user click input file
  - Insert an **empty image block** will (1)
  - Receive FileList (File[]) from input event, **length is n**
  - Insert n image block to editor.
  - Remove the **empty image block** at (1)
