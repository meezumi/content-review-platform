import React, { useState, useEffect } from "react";
import { Box, Paper, Typography, TextField, Button, IconButton, CircularProgress } from "@mui/material";
import { 
  ZoomIn as ZoomInIcon, 
  ZoomOut as ZoomOutIcon, 
  Refresh as ResetZoomIcon,
  Fullscreen as FullscreenIcon 
} from '@mui/icons-material';
import CommentPin from "./CommentPin";

const DocumentViewer = ({ document, comments, onNewComment, scale = 1, onZoomIn, onZoomOut, onResetZoom }) => {
  const [tempPin, setTempPin] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [viewportHeight, setViewportHeight] = useState(window.innerHeight);
  
  // Handle window resize for responsive height
  useEffect(() => {
    const handleResize = () => {
      setViewportHeight(window.innerHeight);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!document) {
    return (
      <Paper sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: 400,
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 3,
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <Typography color="text.secondary">No document selected</Typography>
      </Paper>
    );
  }

  const handleLoad = () => {
    setIsLoading(false);
    setError(null);
  };

  const handleError = () => {
    setIsLoading(false);
    setError('Failed to load document');
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleImageClick = (e) => {
    if (e.target.id !== "document-image") return; // Only trigger on the image itself

    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setTempPin({ x, y });
  };

  const submitContextualComment = () => {
    if (!commentText.trim()) return;
    onNewComment(commentText, tempPin);
    setTempPin(null);
    setCommentText("");
  };

  const documentUrl = `http://localhost:5000/${document.activeVersion ? document.activeVersion.path : document.path}`;
  const mimetype = document.activeVersion ? document.activeVersion.mimetype : document.mimetype;
  const isImage = ["image/jpeg", "image/png", "image/gif", "image/webp"].includes(mimetype);
  const isPDF = mimetype === 'application/pdf';

  // Calculate responsive height based on viewport and screen size
  const getViewerHeight = () => {
    if (isFullscreen) return '100vh';
    
    // Make height more aggressive on larger screens
    if (viewportHeight >= 1080) return Math.min(viewportHeight * 0.85, 900); // 85% on large screens
    if (viewportHeight >= 768) return Math.min(viewportHeight * 0.8, 750);   // 80% on medium screens
    return Math.max(400, viewportHeight * 0.6); // 60% on smaller screens, min 400px
  };

  return (
    <Paper sx={{ 
      position: 'relative',
      borderRadius: 3,
      overflow: 'hidden',
      background: 'rgba(255, 255, 255, 0.05)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      height: isFullscreen ? '100vh' : getViewerHeight(),
      minHeight: isFullscreen ? '100vh' : '400px',
      width: '100%',
      maxWidth: '100%',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Zoom Controls */}
      <Box sx={{ 
        position: 'absolute', 
        top: 16, 
        right: 16, 
        zIndex: 10,
        display: 'flex',
        gap: 1
      }}>
        {onZoomOut && (
          <IconButton 
            onClick={onZoomOut}
            sx={{ 
              background: 'rgba(0, 0, 0, 0.8)',
              color: 'white',
              backdropFilter: 'blur(10px)',
              '&:hover': { background: 'rgba(0, 0, 0, 0.9)' }
            }}
          >
            <ZoomOutIcon />
          </IconButton>
        )}
        {onResetZoom && (
          <IconButton 
            onClick={onResetZoom}
            sx={{ 
              background: 'rgba(0, 0, 0, 0.8)',
              color: 'white',
              backdropFilter: 'blur(10px)',
              '&:hover': { background: 'rgba(0, 0, 0, 0.9)' }
            }}
          >
            <ResetZoomIcon />
          </IconButton>
        )}
        {onZoomIn && (
          <IconButton 
            onClick={onZoomIn}
            sx={{ 
              background: 'rgba(0, 0, 0, 0.8)',
              color: 'white',
              backdropFilter: 'blur(10px)',
              '&:hover': { background: 'rgba(0, 0, 0, 0.9)' }
            }}
          >
            <ZoomInIcon />
          </IconButton>
        )}
        <IconButton 
          onClick={toggleFullscreen}
          sx={{ 
            background: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            backdropFilter: 'blur(10px)',
            '&:hover': { background: 'rgba(0, 0, 0, 0.9)' }
          }}
        >
          <FullscreenIcon />
        </IconButton>
      </Box>

      {/* Loading Indicator */}
      {isLoading && (
        <Box sx={{ 
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 5
        }}>
          <CircularProgress sx={{ color: '#6366f1' }} />
        </Box>
      )}

      {/* Error Message */}
      {error && (
        <Box sx={{ 
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 400,
          flexDirection: 'column',
          gap: 2
        }}>
          <Typography color="error" variant="h6">{error}</Typography>
          <Typography color="text.secondary">
            Try refreshing the page or contact support
          </Typography>
        </Box>
      )}

      {/* Document Content */}
      {!error && (
        <Box 
          onClick={(isImage || isPDF) ? handleImageClick : null}
          sx={{ 
            width: '100%',
            height: '100%',
            flex: 1,
            position: isFullscreen ? 'fixed' : 'relative',
            top: isFullscreen ? 0 : 'auto',
            left: isFullscreen ? 0 : 'auto',
            zIndex: isFullscreen ? 9999 : 1,
            background: isFullscreen ? 'rgba(0, 0, 0, 0.9)' : '#f8f9fa',
            cursor: (isImage || isPDF) ? 'crosshair' : 'default',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden'
          }}
        >
          {isPDF ? (
            <iframe
              src={`${documentUrl}#zoom=${Math.round(scale * 100)}`}
              style={{
                width: '100%',
                height: '100%',
                minHeight: 'inherit',
                border: 'none',
                background: 'white',
                borderRadius: isFullscreen ? 0 : '12px',
                display: 'block'
              }}
              onLoad={handleLoad}
              onError={handleError}
              title="Document Preview"
            />
          ) : isImage ? (
            <img
              id="document-image"
              src={documentUrl}
              alt={document.activeVersion?.originalName || document.originalName}
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                transform: `scale(${scale})`,
                transition: 'transform 0.2s ease',
                borderRadius: '8px',
                objectFit: 'contain'
              }}
              onLoad={handleLoad}
              onError={handleError}
            />
          ) : (
            <Box sx={{ 
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
              p: 4,
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: 2,
              backdropFilter: 'blur(10px)'
            }}>
              <Typography variant="h6" color="text.primary">
                Preview not available for this file type
              </Typography>
              <Typography color="text.secondary">
                File: {document.activeVersion?.originalName || document.originalName}
              </Typography>
              <Typography color="text.secondary">
                Type: {mimetype}
              </Typography>
            </Box>
          )}
        </Box>
      )}

      {/* Render existing comment pins */}
      {comments
        .filter((c) => c.isContextual)
        .map((comment) => (
          <CommentPin key={comment._id} comment={comment} />
        ))}

      {/* Render temporary pin and input box */}
      {tempPin && (
        <Paper
          sx={{
            position: "absolute",
            left: `${tempPin.x}%`,
            top: `${tempPin.y}%`,
            p: 2,
            zIndex: 1000,
            transform: "translate(-50%, 10px)",
            background: 'rgba(0, 0, 0, 0.9)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            maxWidth: 300
          }}
        >
          <Typography variant="subtitle2" sx={{ color: 'white', mb: 1 }}>
            Add comment at this point:
          </Typography>
          <TextField
            autoFocus
            fullWidth
            multiline
            rows={2}
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            sx={{ 
              my: 1,
              '& .MuiOutlinedInput-root': {
                background: 'rgba(255, 255, 255, 0.1)',
                '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.5)' },
                '&.Mui-focused fieldset': { borderColor: '#6366f1' }
              },
              '& .MuiInputBase-input': { color: 'white' }
            }}
            placeholder="Enter your comment..."
          />
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
            <Button 
              size="small" 
              onClick={() => setTempPin(null)}
              sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
            >
              Cancel
            </Button>
            <Button
              size="small"
              variant="contained"
              onClick={submitContextualComment}
              sx={{ 
                background: 'linear-gradient(135deg, #6366f1, #ec4899)',
                '&:hover': { 
                  background: 'linear-gradient(135deg, #5855eb, #d946ef)' 
                }
              }}
            >
              Save
            </Button>
          </Box>
        </Paper>
      )}
    </Paper>
  );
};

export default DocumentViewer;
